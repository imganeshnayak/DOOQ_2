import { Router } from 'express';
import multer from 'multer';
import { register, login, updateUserLocation, getCurrentUser, forgotPassword, resetPassword, verifyOTP, getProfile, updateProfile, updatePushToken, getUserAvatars, getUserById,createReview } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/register', register);
router.post('/login', login);
router.post('/update-location', authMiddleware, updateUserLocation);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOTP);
router.get('/profile/:userId', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);
router.post('/update-push-token', authMiddleware, updatePushToken);
router.post('/avatars', authMiddleware, getUserAvatars);
router.post('/:userId/reviews', authMiddleware, createReview);

router.get('/:id', authMiddleware, getUserById);

export default router;