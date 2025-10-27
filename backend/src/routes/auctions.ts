import { Router } from 'express';
import multer from 'multer';
import {
  createAuction,
  getAuctions,
  getAuction,
  updateAuction,
  deleteAuction,
  getUserAuctions,
  startAuction,
  endAuction,
  cancelAuction,
  getAuctionAnalytics,
  validateCreateAuction
} from '../controllers/auctionController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Public routes
router.get('/', optionalAuth, getAuctions);
router.get('/:id', optionalAuth, getAuction);

// Protected routes
router.post('/', authenticateToken, upload.array('images', 5), validateCreateAuction, createAuction);
router.put('/:id', authenticateToken, upload.array('images', 5), updateAuction);
router.delete('/:id', authenticateToken, deleteAuction);
router.get('/user/my-auctions', authenticateToken, getUserAuctions);

// Seller auction management routes
router.post('/:id/start', authenticateToken, startAuction);
router.post('/:id/end', authenticateToken, endAuction);
router.post('/:id/cancel', authenticateToken, cancelAuction);
router.get('/:id/analytics', authenticateToken, getAuctionAnalytics);

export default router;
