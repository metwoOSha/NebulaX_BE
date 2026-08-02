import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/index.js';
import { createAccessToken } from '../helpers/token.helper.js';
import { cookieOptions } from '../config/app.config.js';

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, name, email, password, avatar_color_id, about } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await pool.query('SELECT email FROM users WHERE email = $1', [normalizedEmail]);

        if (existingUser.rows.length > 0) return res.status(409).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await pool.query(
            'INSERT INTO users (username, name, email, password_hash, avatar_color_id, about) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, username, name, email',
            [username, name, normalizedEmail, hashedPassword, avatar_color_id, about]
        );

        const token = createAccessToken(user.rows[0]);

        res.cookie('token', token, cookieOptions);

        res.status(201).json({ user: user.rows[0] });
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const user = await pool.query('SELECT id, username, name, email, password_hash FROM users WHERE email = $1', [
            normalizedEmail,
        ]);

        if (user.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        const { password_hash, ...userWithoutPassword } = user.rows[0];

        const token = createAccessToken(userWithoutPassword);

        res.cookie('token', token, cookieOptions);

        res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
        next(error);
    }
}

export async function getSocketToken(req: Request, res: Response, next: NextFunction) {
    try {
        res.status(200).json({ token: req.cookies.token });
    } catch (error) {
        next(error);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        res.clearCookie('token', cookieOptions);
        res.status(200).json({ message: 'Logged out' });
    } catch (error) {
        next(error);
    }
}

export async function me(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.user;

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

        res.status(200).json({ user: { ...user.rows[0], tags: user.rows[0].tags ?? [] } });
    } catch (error) {
        next(error);
    }
}
