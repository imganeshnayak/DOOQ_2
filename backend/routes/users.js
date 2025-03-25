import { Router } from 'express';
import { register, login, updateUserLocation, getCurrentUser, forgotPassword, resetPassword, verifyOTP,  getProfile,updateProfile, updatePushToken} from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/update-location', authMiddleware, updateUserLocation);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOTP);
router.get('/profile/:userId', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/update-push-token', authMiddleware, updatePushToken);

export default router;