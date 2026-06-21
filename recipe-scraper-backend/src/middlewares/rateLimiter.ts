import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        message: ' Zu viele Versuche - bitte in 15 Minuten erneut versuchen',
    },
});

// /extract kostet pro Call yt-dlp + eine Gemini-Anfrage → knapp halten.
export const extractRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        message: 'Zu viele Analysen - bitte in 15 Minuten erneut versuchen',
    },
});
