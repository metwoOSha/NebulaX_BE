import type { Socket } from 'socket.io';

interface SocketUser {
    id: string;
    username: string;
}

export function registerTypingHandlers(socket: Socket, user: SocketUser) {
    socket.on('typing', (data: { roomId: string }) => {
        socket.volatile.to(data.roomId).emit('typing', {
            userId: user.id,
            username: user.username,
        });
    });
}
