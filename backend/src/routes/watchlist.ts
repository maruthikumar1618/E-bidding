import { Router } from 'express';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '../controllers/watchlistController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', addToWatchlist);
router.delete('/:auction_id', removeFromWatchlist);
router.get('/', getWatchlist);

export default router;
