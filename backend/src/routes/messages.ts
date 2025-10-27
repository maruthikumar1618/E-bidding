import { Router } from 'express';
import { sendMessage, getConversation, getConversations } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:auctionId/:otherUserId', getConversation);

export default router;
