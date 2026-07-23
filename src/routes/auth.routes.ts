import { Router } from 'express';
import { authRateLimit } from '../middleware/rateLimit.middleware.js';
import { register, login, logout, me } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authRateLimit, validate(registerSchema), register);
router.post('/login', authRateLimit, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);

export default router;
