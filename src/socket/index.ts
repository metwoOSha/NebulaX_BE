import type { Server, Socket } from 'socket.io';
import { subscriber } from '../redis/index.js';
import { verifyToken } from '../helpers/token.helper.js';
import { registerRoomHandlers } from './handlers/room.handler.js';
import { registerMessageHandlers } from './handlers/message.handler.js';
import { registerTypingHandlers } from './handlers/typing.handler.js';

export function initSocket(io: Server) {
    io.use((socket, next) => {
        const cookie = socket.handshake.headers.cookie;
        const token = cookie?.split('token=')[1]?.split(';')[0];

        if (!token) return next(new Error('Unauthorized'));

        try {
            const payload = verifyToken(token);
            socket.data.user = payload;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const user = socket.data.user;

        registerRoomHandlers(socket, io, user);
        registerMessageHandlers(socket, user);
        registerTypingHandlers(socket, user);
    });

    subscriber.pSubscribe('room:*', (message, channel) => {
        const roomId = channel.replace('room:', '');
        io.to(roomId).emit('message', JSON.parse(message));
    });
}
