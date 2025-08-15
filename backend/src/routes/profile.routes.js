
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { updateProfile, getProfile } from '../controllers/profile.controller.js';

const router = express.Router();

// Protected routes
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

export default router;
