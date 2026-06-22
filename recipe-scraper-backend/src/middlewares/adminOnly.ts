import type { RequestHandler } from 'express';

const adminOnly: RequestHandler = (req, res, next) => {
    if (req.role !== 'admin') {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
    next();
};

export default adminOnly;
