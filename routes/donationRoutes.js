// routes/donationRoutes.js
import express from 'express';
import {
  createDonation,
  getDonationHistory,
  setupRecurringDonation
} from '../controllers/donationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/donate', protect, createDonation);
router.get('/donation-history', protect, getDonationHistory);
router.post('/setup-recurring-donation', protect, setupRecurringDonation);

export default router;