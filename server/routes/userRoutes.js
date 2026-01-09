const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

const wardrobeController = require('../controllers/wardrobeController');

// Get current user profile
router.get('/profile', verifyToken, userController.getProfile);

// Update user profile
router.put('/profile', verifyToken, userController.updateProfile);

// Purchase items
router.post('/purchase', verifyToken, userController.purchase);

// Scent Wardrobe Stats
router.get('/wardrobe-stats', verifyToken, wardrobeController.getWardrobeStats);

// Scent Check-in (SOTD)
router.post('/check-in', verifyToken, wardrobeController.checkInScent);

module.exports = router;
