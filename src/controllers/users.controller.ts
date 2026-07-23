import type { Request, Response, NextFunction } from 'express';
import { pool } from '../db/index.js';

export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        const user = await pool.query(
            `SELECT
                u.id, u.username, u.name, u.email, u.avatar_color_id, u.about,
                array_agg(t.name) FILTER (WHERE t.name IS NOT NULL) as tags
            FROM users u
            LEFT JOIN user_tags ut ON u.id = ut.user_id
            LEFT JOIN tags t ON ut.tag_id = t.id
            WHERE u.id = $1
            GROUP BY u.id`,
            [id]
        );

        if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ user: user.rows[0] });
    } catch (error) {
        next(error);
    }
}

export async function patchUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const whitelist = ['username', 'name', 'about', 'avatar_color_id'];
        const fields: string[] = [];
        const params: unknown[] = [];

        for (const [key, value] of Object.entries(req.body)) {
            if (whitelist.includes(key)) {
                params.push(value);
                fields.push(`${key} = $${params.length}`);
            }
        }

        if (fields.length === 0) return res.status(400).json({ message: 'No valid fields to update' });

        params.push(id);

        const result = await pool.query(
            `UPDATE users SET ${fields.join(', ')} 
       WHERE id = $${params.length}
       RETURNING id, username, name, email, avatar_color_id, about`,
            params
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        next(error);
    }
}
