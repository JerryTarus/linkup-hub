import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { initiatePayment, paymentCallback } from '../controllers/payment.controller.js';

const router = Router();

// Route to initiate a payment. This is protected and requires a logged-in user.
router.post('/initiate', protect, initiatePayment);

// Public callback route for the Daraja API to send payment status updates.
router.post('/callback', paymentCallback);

export default router;
