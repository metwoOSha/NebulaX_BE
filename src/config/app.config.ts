import { env } from './env.config.js';

export const corsOptions = {
    origin: env.CLIENT_URL,
    credentials: true,
};

export const socketOptions = {
    cors: corsOptions,
};

export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const rateLimitOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later',
};
