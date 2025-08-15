
const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { updateProfile, getProfile } = require('../controllers/profile.controller');

const router = express.Router();

// Protected routes
router.get('/me', authenticateToken, getProfile);
router.put('/me', authenticateToken, updateProfile);

module.exports = router;
