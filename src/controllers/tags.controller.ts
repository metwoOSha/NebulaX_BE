import type { Request, Response, NextFunction } from 'express';
import { pool } from '../db/index.js';

export async function getTags(req: Request, res: Response, next: NextFunction) {
    try {
        const tags = await pool.query('SELECT id, name FROM tags ORDER BY name');
        res.status(200).json({ tags: tags.rows });
    } catch (error) {
        next(error);
    }
}
