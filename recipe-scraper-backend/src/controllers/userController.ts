import type { RequestHandler } from 'express';
import { User, RefreshToken } from '#models';
import type { UpdateUserInput } from '#schemas';

export const getUsers: RequestHandler = async (_req, res, next) => {
    try {
        const users = await User.find({ role: 'user' }).sort({
            lastName: 1,
            firstName: 1,
        });
        res.json({ data: users });
    } catch (err) {
        next(err);
    }
};

export const updateUser: RequestHandler<
    { id: string },
    {},
    UpdateUserInput
> = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User nicht gefunden' });
            return;
        }

        const { name, email, password, role } = req.body;

        if (email !== undefined) {
            const normalized = email.toLowerCase();
            if (normalized !== user.email) {
                const taken = await User.findOne({ email: normalized });
                if (taken) {
                    res.status(409).json({
                        message: 'email already taken',
                    });
                    return;
                }
                user.email = normalized;
            }
        }

        if (name !== undefined) user.name = name;
        if (role !== undefined) user.role = role;
        if (password !== undefined) user.password = password;

        await user.save();
        res.json({ data: user });
    } catch (err) {
        next(err);
    }
};

export const deleteUser: RequestHandler<{ id: string }> = async (
    req,
    res,
    next,
) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user.id === req.userId) {
            res.status(400).json({
                message: 'Own Account cannot be deleted.',
            });
            return;
        }

        await RefreshToken.deleteMany({ userId: user._id });
        await user.deleteOne();

        res.status(204).end();
    } catch (err) {
        next(err);
    }
};
