import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/token.helper.js';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
