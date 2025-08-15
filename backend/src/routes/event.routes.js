const express = require('express');
const { protect, checkRole } = require('../middleware/auth.middleware');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpToEvent
} = require('../controllers/event.controller');

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

module.exports = router;