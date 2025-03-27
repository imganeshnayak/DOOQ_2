import { Router } from 'express';
import { createOffer, getOffers, getOffersForTask } from '../controllers/offerController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Create new offer
router.post('/', authMiddleware, createOffer);
// Get all offers
router.get('/', authMiddleware, getOffers);
router.get('/', getOffers);
router.get('/task/:taskId', authMiddleware, getOffersForTask);

export default router;