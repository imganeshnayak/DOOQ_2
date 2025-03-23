import { Router } from 'express';
import { createOffer, getOffers } from '../controllers/offerController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Create new offer
router.post('/', authMiddleware, createOffer);
// Get all offers
router.get('/', authMiddleware, getOffers);
router.get('/', getOffers);

export default router;