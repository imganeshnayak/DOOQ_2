import express from 'express';
import { getAchievements } from '../controllers/achievementController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getAchievements);

export default router;