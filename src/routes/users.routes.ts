import { Router } from 'express';
import { getUserById, patchUserById } from '../controllers/users.controller.js';

const router = Router();

router.get('/:id', getUserById);
router.patch('/:id,', patchUserById);

export default router;
