// Import the Express router to define API endpoints.
import { Router } from 'express';
// Import controller functions that contain the logic for each route.
import { signup, login, logout, getMe } from '../controllers/auth.controller.js';
// Import middleware to protect routes that require authentication.
import { protect } from '../middleware/auth.middleware.js';

// Initialize a new router instance.
const router = Router();

// Define the public routes that do not require authentication.
// POST /api/v1/auth/signup - Handles new user registration.
router.post('/signup', signup);
// POST /api/v1/auth/login - Handles user login.
router.post('/login', login);
// POST /api/v1/auth/logout - Handles user logout.
router.post('/logout', logout);

// Define protected routes. The 'protect' middleware will run first.
// If the user is not authenticated, the request will be rejected.
// GET /api/v1/auth/me - Fetches the profile of the currently logged-in user.
router.get('/me', protect, getMe);

// Export the router to be used in the main server file.
export default router;