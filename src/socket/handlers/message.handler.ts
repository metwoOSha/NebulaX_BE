import type { Socket } from 'socket.io';
import { pool } from '../../db/index.js';
import { publisher } from '../../redis/index.js';

interface MessageData {
    roomId: string;
    text: string;
}

interface SocketUser {
    id: string;
    username: string;
    avatar_color_id: number;
}

export function registerMessageHandlers(socket: Socket, user: SocketUser) {
    socket.on('message', async (data: MessageData) => {
        const message = await pool.query(
            `INSERT INTO messages (room_id, user_id, text)
       VALUES ($1, $2, $3)
       RETURNING id, text, created_at`,
            [data.roomId, user.id, data.text]
        );

        const payload = {
            ...message.rows[0],
            user_id: user.id,
            username: user.username,
            avatar_color_id: user.avatar_color_id,
        };

        await publisher.publish(`room:${data.roomId}`, JSON.stringify(payload));
    });
}
