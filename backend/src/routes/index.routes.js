import { Router } from 'express';

const router = Router();

import authRoutes from './auth.routes.js';
import eventRoutes from './event.routes.js';
import paymentRoutes from './payment.routes.js';
import profileRoutes from './profile.routes.js';

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the LinkUp Hub API!' });
});

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/payments', paymentRoutes);
router.use('/profiles', profileRoutes);

export default router;