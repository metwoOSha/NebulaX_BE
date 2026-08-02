import { Router } from 'express';
import {
    getRooms,
    getRoomById,
    getRoomMembers,
    createRoom,
    updateRoom,
    deleteRoom,
    joinRoom,
    leaveRoom,
} from '../controllers/rooms.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getRooms);
router.get('/:id', authMiddleware, getRoomById);
router.get('/:id/members', authMiddleware, getRoomMembers);
router.post('/', authMiddleware, createRoom);
router.patch('/:id', authMiddleware, updateRoom);
router.delete('/:id', authMiddleware, deleteRoom);
router.post('/:id/join', authMiddleware, joinRoom);
router.delete('/:id/leave', authMiddleware, leaveRoom);

export default router;
