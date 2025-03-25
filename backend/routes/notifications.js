import express from 'express';
import auth from '../middleware/auth.js';
import { 
  getNotifications, 
  deleteNotification, 
  deleteAllNotifications 
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', auth, getNotifications);
router.delete('/:id', auth, deleteNotification);
router.delete('/', auth, deleteAllNotifications);

export default router;