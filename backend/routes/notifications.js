import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead } from '../controllers/notificationController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, getNotifications);
router.get('/unread/count', authMiddleware, getUnreadCount);
router.patch('/:notificationId/read', authMiddleware, markAsRead);

export default router;