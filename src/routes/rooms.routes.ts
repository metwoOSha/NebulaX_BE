import { Router } from 'express';
import { getRooms, getRoomById, createRoom, joinRoom, leaveRoom } from '../controllers/rooms.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getRooms);
router.get('/:id', authMiddleware, getRoomById);
router.post('/', authMiddleware, createRoom);
router.post('/:id/join', authMiddleware, joinRoom);
router.delete('/:id/leave', authMiddleware, leaveRoom);

export default router;
