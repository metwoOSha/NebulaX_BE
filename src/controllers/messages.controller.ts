import type { Request, Response, NextFunction } from 'express';
import { pool } from '../db/index.js';

export async function getMessages(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const { cursor, limit = 50 } = req.query;

        const messages = await pool.query(
            `SELECT m.id, m.text, m.created_at,
				u.id as user_id, u.username, u.avatar_color_id
				FROM messages m
				JOIN users u ON m.user_id = u.id
				WHERE m.room_id = $1
				${cursor ? 'AND m.created_at < $3' : ''}
				ORDER BY m.created_at DESC
				LIMIT $2`,
            cursor ? [id, limit, cursor] : [id, limit]
        );

        const items = messages.rows.reverse();

        res.status(200).json({
            messages: items,
            nextCursor: items.length > 0 ? items[0].created_at : null,
        });
    } catch (error) {
        next(error);
    }
}
