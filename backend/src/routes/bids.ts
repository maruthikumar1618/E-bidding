import { Router } from 'express';
import {
  placeBid,
  getAuctionBids,
  getUserBids,
  getWinningBids,
  validatePlaceBid
} from '../controllers/bidController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protected routes
router.post('/', authenticateToken, validatePlaceBid, placeBid);
router.get('/user/my-bids', authenticateToken, getUserBids);
router.get('/user/winning', authenticateToken, getWinningBids);

// Public routes
router.get('/auction/:auctionId', getAuctionBids);

export default router;
