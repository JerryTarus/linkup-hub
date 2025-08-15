// Import the Express router.
import { Router } from 'express';
// Import the controller functions that handle the logic for each route.
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller.js';
// Import our security middleware.
import { protect, checkRole } from '../middleware/auth.middleware.js';

// Initialize a new router instance.
const router = Router();

// --- Public Routes ---
// Anyone can view the list of events and details of a single event.
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// --- Protected Routes (Admin & Super Admin only) ---
// To create, update, or delete an event, a user must be authenticated ('protect')
// and have a role of 'Admin' or 'Super Admin' ('checkRole').
router.post('/', protect, checkRole(['Admin', 'Super Admin']), createEvent);
router.put('/:id', protect, checkRole(['Admin', 'Super Admin']), updateEvent);
router.delete('/:id', protect, checkRole(['Admin', 'Super Admin']), deleteEvent);

// Export the router to be used in the main server file.
export default router;
const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
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
router.post('/', authenticateToken, authorizeRoles(['admin', 'super_admin']), createEvent);
router.put('/:id', authenticateToken, authorizeRoles(['admin', 'super_admin']), updateEvent);
router.delete('/:id', authenticateToken, authorizeRoles(['admin', 'super_admin']), deleteEvent);

// RSVP route
router.post('/:id/rsvp', authenticateToken, rsvpToEvent);

module.exports = router;
