import { Router } from 'express';
import { sendMessage, getMessages, getConversations } from '../controllers/messageController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Error handling wrapper
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/conversations', asyncHandler(getConversations));
router.get('/:userId', asyncHandler(getMessages));
router.post('/', asyncHandler(sendMessage));

export default router;