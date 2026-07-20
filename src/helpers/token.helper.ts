import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.config.js';

interface TokenPayload {
    id: string;
    username: string;
    email: string;
}

export function createAccessToken(user: TokenPayload) {
    return jwt.sign({ id: user.id, username: user.username, email: user.email }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    });
}

export function verifyToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
