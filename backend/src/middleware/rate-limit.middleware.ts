import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        error: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased for development (was 5)
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later',
    },
    skipSuccessfulRequests: true,
});

// Rate limiter for login attempts
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased for development (was 5)
    message: {
        success: false,
        error: 'Too many login attempts, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 payment requests per hour
    message: {
        success: false,
        error: 'Too many payment requests, please try again later',
    },
});
