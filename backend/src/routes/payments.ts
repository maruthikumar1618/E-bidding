import { Router } from 'express';
import { createPayment, getUserPayments } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', createPayment);
router.get('/', getUserPayments);

export default router;
