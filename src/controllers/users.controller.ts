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
    const client = await pool.connect();

    try {
        const { id } = req.params;

        if (req.user.id !== id) return res.status(403).json({ message: 'Forbidden' });

        const whitelist = ['username', 'name', 'about', 'avatar_color_id'];
        const fields: string[] = [];
        const params: unknown[] = [];

        for (const [key, value] of Object.entries(req.body)) {
            if (whitelist.includes(key)) {
                params.push(value);
                fields.push(`${key} = $${params.length}`);
            }
        }

        const { tags } = req.body as { tags?: unknown };
        const hasTags = Array.isArray(tags);

        if (fields.length === 0 && !hasTags) return res.status(400).json({ message: 'No valid fields to update' });

        await client.query('BEGIN');

        if (fields.length > 0) {
            params.push(id);
            await client.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length}`, params);
        }

        if (hasTags) {
            await client.query('DELETE FROM user_tags WHERE user_id = $1', [id]);
            if (tags.length > 0) {
                await client.query(
                    `INSERT INTO user_tags (user_id, tag_id)
                     SELECT $1, t.id FROM tags t WHERE t.name = ANY($2::text[])`,
                    [id, tags]
                );
            }
        }

        const result = await client.query(
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

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found' });
        }

        await client.query('COMMIT');

        res.status(200).json({ user: { ...result.rows[0], tags: result.rows[0].tags ?? [] } });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
}
