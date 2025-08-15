import { Router } from 'express';

const router = Router();

const authRoutes = require('./auth.routes');
const eventRoutes = require('./event.routes');
const paymentRoutes = require('./payment.routes');
const profileRoutes = require('./profile.routes');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the LinkUp Hub API!' });
});

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/payments', paymentRoutes);
router.use('/profiles', profileRoutes);

export default router;