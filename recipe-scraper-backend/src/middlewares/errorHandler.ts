import type { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error(`\x1b[31m${err.stack}\x1b[0m`);
    } else {
        console.error({
            message: err.message,
            stack: err.stack,
            status: err.status,
        });
    }

    const statusCode =
        err.status ||
        err.cause?.status ||
        (err.name === 'ValidationError' ? 400 : 500);

    res.status(statusCode).json({
        message: err.message || 'Internal Server error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

export default errorHandler;
