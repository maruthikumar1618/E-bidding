import { Router } from 'express';
import { getUserProfile, getUsers } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/:id', getUserProfile);

// Protected routes
router.get('/', authenticateToken, getUsers);

export default router;
