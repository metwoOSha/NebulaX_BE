import pg from 'pg';
import { env } from '../config/env.config.js';

const { Pool } = pg;

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

pool.on('error', (err) => {
    console.error('Database error:', err);
});
