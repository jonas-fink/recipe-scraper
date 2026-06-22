import type { RequestHandler } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '#models';
import type {
    RegisterInput,
    LoginInput,
    ChangeEmailInput,
    ChangePasswordInput,
} from '#schemas';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const signAccess = (userId: string, role: 'user' | 'admin') =>
    jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET as string, {
        expiresIn: '15m',
    });

const signRefresh = (userId: string) =>
    jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: '7d',
        jwtid: crypto.randomUUID(),
    });

const hashToken = (token: string) =>
    crypto.createHash('sha256').update(token).digest('hex');

const issueRefreshToken = async (userId: string, family?: string) => {
    const token = signRefresh(userId);
    await RefreshToken.create({
        userId,
        tokenHash: hashToken(token),
        family: family ?? crypto.randomUUID(),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });
    return token;
};

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTS = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('strict' as const),
    path: '/api/v1/auth',
    maxAge: REFRESH_TTL_MS,
};
const CLEAR_COOKIE_OPTS = {
    httpOnly: COOKIE_OPTS.httpOnly,
    secure: COOKIE_OPTS.secure,
    sameSite: COOKIE_OPTS.sameSite,
    path: COOKIE_OPTS.path,
};

export const register: RequestHandler<{}, {}, RegisterInput> = async (
    req,
    res,
    next,
) => {
    try {
        const { name, email, password } = req.body;
        let user;
        try {
            user = await User.create({ name, email, password });
        } catch (err) {
            if ((err as { code?: number }).code === 11000) {
                res.status(409).json({ message: 'Account already exists' });
                return;
            }
            throw err;
        }
        const accessToken = signAccess(user.id, user.role);
        const refreshToken = await issueRefreshToken(user.id);

        res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
        res.status(201).json({ data: { accessToken, user } });
    } catch (err) {
        next(err);
    }
};

export const login: RequestHandler<{}, {}, LoginInput> = async (
    req,
    res,
    next,
) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const oldToken = req.cookies?.refreshToken;
        if (oldToken) {
            await RefreshToken.deleteOne({ tokenHash: hashToken(oldToken) });
        }

        const accessToken = signAccess(user.id, user.role);
        const refreshToken = await issueRefreshToken(user.id);

        res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
        res.json({ data: { accessToken, user } });
    } catch (err) {
        next(err);
    }
};

export const refresh: RequestHandler = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            res.status(401).json({ message: 'Kein refresh token' });
            return;
        }

        let payload: { userId: string };
        try {
            payload = jwt.verify(
                token,
                process.env.JWT_REFRESH_SECRET as string,
            ) as { userId: string };
        } catch {
            res.status(403).json({ message: 'Ungültiges refresh token' });
            return;
        }

        const tokenHash = hashToken(token);
        const stored = await RefreshToken.findOne({ tokenHash });

        if (!stored) {
            res.status(401).json({ message: 'Token unbekannt' });
            return;
        }

        if (stored.replacedByHash) {
            res.status(401).json({ message: 'Token bereits rotiert' });
            return;
        }

        if (stored.revokedAt) {
            await RefreshToken.updateMany(
                { family: stored.family, revokedAt: { $exists: false } },
                { $set: { revokedAt: new Date() } },
            );
            res.status(403).json({ message: 'Token Rotation fehlgeschlagen' });
            return;
        }

        const user = await User.findById(payload.userId);
        if (!user || stored.userId.toString() !== user.id) {
            res.status(403).json({ message: 'Token Rotation fehlgeschlagen' });
            return;
        }

        const newRefresh = await issueRefreshToken(user.id, stored.family);
        const newHash = hashToken(newRefresh);
        const claimed = await RefreshToken.updateOne(
            {
                _id: stored._id,
                replacedByHash: { $exists: false },
                revokedAt: { $exists: false },
            },
            { $set: { replacedByHash: newHash, revokedAt: new Date() } },
        );

        if (claimed.matchedCount === 0) {
            await RefreshToken.deleteOne({ tokenHash: newHash });
            await RefreshToken.updateMany(
                { family: stored.family, revokedAt: { $exists: false } },
                { $set: { revokedAt: new Date() } },
            );
            res.status(403).json({ message: 'Token Rotation fehlgeschlagen' });
            return;
        }

        res.cookie('refreshToken', newRefresh, COOKIE_OPTS);
        res.json({ data: { accessToken: signAccess(user.id, user.role) } });
    } catch (err) {
        next(err);
    }
};

export const logout: RequestHandler = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        if (token) {
            await RefreshToken.deleteOne({ tokenHash: hashToken(token) });
        }
        res.clearCookie('refreshToken', CLEAR_COOKIE_OPTS);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};

export const changeEmail: RequestHandler<{}, {}, ChangeEmailInput> = async (
    req,
    res,
    next,
) => {
    try {
        const { email, currentPassword } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (!(await user.comparePassword(currentPassword))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const normalized = email.toLowerCase();
        if (normalized === user.email.toLowerCase()) {
            res.status(400).json({ message: 'Email is unchanged' });
            return;
        }
        const taken = await User.findOne({ email: normalized });
        if (taken) {
            res.status(409).json({ message: 'Email already in use' });
            return;
        }
        user.email = normalized;
        await user.save();
        res.json({ data: user });
    } catch (err) {
        next(err);
    }
};

export const changePassword: RequestHandler<
    {},
    {},
    ChangePasswordInput
> = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (!(await user.comparePassword(currentPassword))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        if (currentPassword === newPassword) {
            res.status(400).json({
                message: 'New password must differ from current',
            });
            return;
        }

        user.password = newPassword;
        await user.save();

        await RefreshToken.deleteMany({ userId: user._id });
        const refreshToken = await issueRefreshToken(user.id);
        const accessToken = signAccess(user.id, user.role);

        res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
        res.json({ data: { accessToken, user } });
    } catch (err) {
        next(err);
    }
};

export const me: RequestHandler = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ data: user });
    } catch (err) {
        next(err);
    }
};
