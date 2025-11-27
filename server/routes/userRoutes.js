const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

// Get current user profile
router.get('/profile', verifyToken, userController.getProfile);

// Update user profile
router.put('/profile', verifyToken, userController.updateProfile);

// Purchase items
router.post('/purchase', verifyToken, userController.purchase);

module.exports = router;
