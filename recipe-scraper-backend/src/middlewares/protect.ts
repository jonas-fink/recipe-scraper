import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
    userId: string;
    role?: 'user' | 'admin';
}

const protect: RequestHandler = (req, res, next) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token available' });
        return;
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET as string,
        ) as TokenPayload;

        req.userId = decoded.userId;
        req.role = decoded.role ?? 'user';
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export default protect;
