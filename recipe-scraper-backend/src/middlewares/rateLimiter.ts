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

// /refresh is hit on every app boot + token cycle → lenient, but still capped
// to blunt refresh-token brute force / rotation abuse.
export const refreshRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Zu viele Anfragen - bitte kurz warten' },
});

// Blanket per-IP safety net for the whole API.
export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Zu viele Anfragen - bitte kurz warten' },
});
