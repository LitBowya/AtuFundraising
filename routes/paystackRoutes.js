// routes/paymentRoutes.js
import express from 'express';
import {
  initializePayment,
  verifyPayment,
  setupRecurringPayment,
} from '../controllers/paystackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initialize', protect, initializePayment);
router.get('/verify', protect, verifyPayment);
router.post('/recurring', protect, setupRecurringPayment);

export default router;
