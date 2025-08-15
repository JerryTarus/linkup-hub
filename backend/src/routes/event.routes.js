import express from 'express';
import { protect, checkRole } from '../middleware/auth.middleware.js';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpToEvent
} from '../controllers/event.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', protect, checkRole(['Admin', 'Super Admin']), createEvent);
router.put('/:id', protect, checkRole(['Admin', 'Super Admin']), updateEvent);
router.delete('/:id', protect, checkRole(['Admin', 'Super Admin']), deleteEvent);

// RSVP route
router.post('/:id/rsvp', protect, rsvpToEvent);

export default router;