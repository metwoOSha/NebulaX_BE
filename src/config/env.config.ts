import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || 3001,
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL || '',
    REDIS_URL: process.env.REDIS_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};
