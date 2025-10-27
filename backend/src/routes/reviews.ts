import { Router } from 'express';
import { createReview, getAuctionReviews } from '../controllers/reviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/auction/:auctionId', getAuctionReviews);

// Protected routes
router.post('/', authenticateToken, createReview);

export default router;
