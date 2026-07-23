import type { Request, Response, NextFunction } from 'express';
import { pool } from '../db/index.js';

export async function getRooms(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user.id;

        const [my, joined, recommended] = await Promise.all([
            pool.query(
                `SELECT r.* FROM rooms r
					JOIN room_members rm ON r.id = rm.room_id
					WHERE rm.user_id = $1 AND rm.role = 'admin'`,
                [userId]
            ),
            pool.query(
                `SELECT r.* FROM rooms r
					JOIN room_members rm ON r.id = rm.room_id
					WHERE rm.user_id = $1 AND rm.role = 'member'`,
                [userId]
            ),
            pool.query(
                `SELECT r.id, r.name, r.description, r.theme_id, r.created_at
					FROM rooms r
					JOIN room_tags rt ON r.id = rt.room_id
					JOIN user_tags ut ON rt.tag_id = ut.tag_id
					LEFT JOIN room_members rm ON r.id = rm.room_id AND rm.user_id = $1
					WHERE ut.user_id = $1 AND rm.room_id IS NULL
					GROUP BY r.id
					ORDER BY COUNT(rt.tag_id) DESC`,
                [userId]
            ),
        ]);

        res.status(200).json({
            my: my.rows,
            joined: joined.rows,
            recommended: recommended.rows,
        });
    } catch (error) {
        next(error);
    }
}

export async function getRoomById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        const room = await pool.query(
            `SELECT r.*, rm.role
				FROM rooms r
				LEFT JOIN room_members rm ON r.id = rm.room_id AND rm.user_id = $2
				WHERE r.id = $1`,
            [id, req.user.id]
        );

        if (room.rows.length === 0) return res.status(404).json({ message: 'Room not found' });

        res.status(200).json({ room: room.rows[0] });
    } catch (error) {
        next(error);
    }
}

export async function createRoom(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, description, theme_id } = req.body;
        const userId = req.user.id;

        const room = await pool.query(
            'INSERT INTO rooms (name, description, theme_id) VALUES ($1, $2, $3) RETURNING id, name, description, theme_id, created_at',
            [name, description, theme_id]
        );

        await pool.query('INSERT INTO room_members (room_id, user_id, role) VALUES ($1, $2, $3)', [
            room.rows[0].id,
            userId,
            'admin',
        ]);

        res.status(201).json({ room: room.rows[0] });
    } catch (error) {
        next(error);
    }
}

export async function joinRoom(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const room = await pool.query('SELECT id FROM rooms WHERE id = $1', [id]);
        if (room.rows.length === 0) return res.status(409).json({ message: 'Already a member' });

        const existing = await pool.query('SELECT role FROM room_members WHERE room_id = $1 AND user_id = $2', [
            id,
            userId,
        ]);
        if (existing.rows.length > 0) return res.status(409).json({ message: 'Already a member' });

        await pool.query('INSERT INTO room_members (room_id, user_id, role) VALUES ($1, $2, $3)', [
            id,
            userId,
            'member',
        ]);

        res.status(200).json({ message: 'Joined successfully' });
    } catch (error) {
        next(error);
    }
}

export async function leaveRoom(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const existing = await pool.query('SELECT role FROM room_members WHERE room_id = $1 AND user_id = $2', [
            id,
            userId,
        ]);
        if (existing.rows.length === 0) return res.status(404).json({ message: 'Not a member' });

        if (existing.rows[0].role === 'admin') return res.status(403).json({ message: 'Admin cannot leave the room' });

        await pool.query('DELETE FROM room_members WHERE room_id = $1 AND user_id = $2', [id, userId]);

        res.status(200).json({ message: 'Left successfully' });
    } catch (error) {
        next(error);
    }
}
