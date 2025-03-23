import { Router } from 'express';
import userRoutes from './users.js';
import taskRoutes from './tasks.js';
import offerRoutes from './offers.js';
import messageRoutes from './messages.js';
import notificationRoutes from './notifications.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use('/auth', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/offers', authMiddleware, offerRoutes);
router.use('/notifications', authMiddleware, notificationRoutes);
router.use('/messages', authMiddleware, messageRoutes); // ✅ Now protected
router.use('/:userId', authMiddleware, getMessages);

export default router;