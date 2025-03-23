import { Router } from 'express';
import { register, login, updateUserLocation, getCurrentUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/update-location', authMiddleware, updateUserLocation);
router.get('/me', authMiddleware, getCurrentUser);

export default router;