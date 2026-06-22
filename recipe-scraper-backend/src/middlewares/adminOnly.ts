import type { RequestHandler } from 'express';

const adminOnly: RequestHandler = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

export default adminOnly;
