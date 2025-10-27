import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getCategories);

// Protected routes (admin only - you can add admin middleware later)
router.post('/', authenticateToken, createCategory);

export default router;
