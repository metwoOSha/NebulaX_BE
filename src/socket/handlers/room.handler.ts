import type { Server, Socket } from 'socket.io';
import { publisher } from '../../redis/index.js';

interface SocketUser {
    id: string;
    username: string;
}

export function registerRoomHandlers(socket: Socket, io: Server, user: SocketUser) {
    socket.on('join_room', async (roomId: string) => {
        socket.join(roomId);
        socket.data.room = roomId;
        await publisher.sAdd(`room:${roomId}:online`, user.id);
        const online = await publisher.sMembers(`room:${roomId}:online`);
        io.to(roomId).emit('online_users', online);
    });

    socket.on('leave_room', async (roomId: string) => {
        socket.leave(roomId);
        await publisher.sRem(`room:${roomId}:online`, user.id);
        const online = await publisher.sMembers(`room:${roomId}:online`);
        io.to(roomId).emit('online_users', online);
    });

    socket.on('disconnect', async () => {
        const room = socket.data.room;
        if (room) {
            await publisher.sRem(`room:${room}:online`, user.id);
            const online = await publisher.sMembers(`room:${room}:online`);
            io.to(room).emit('online_users', online);
        }
    });
}
