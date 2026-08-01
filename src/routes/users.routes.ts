import { Router } from 'express';
import { getUserById, patchUserById } from '../controllers/users.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/:id', getUserById);
router.patch('/:id', authMiddleware, patchUserById);

export default router;
