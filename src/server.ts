import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { env } from './config/env.config.js';
import { socketOptions } from './config/app.config.js';
import { pool } from './db/index.js';

const httpServer = createServer(app);

export const io = new Server(httpServer, socketOptions);

const start = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('PostgreSQL connected');

        httpServer.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT}`);
        });
    } catch (err) {
        console.error('PostgreSQL connection failed:', err);
        process.exit(1);
    }
};

start();
