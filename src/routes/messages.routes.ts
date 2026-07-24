import { Router } from 'express';
import { getMessages } from '../controllers/messages.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router({ mergeParams: true });

router.get('/', authMiddleware, getMessages);

export default router;
