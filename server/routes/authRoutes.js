const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail); // API endpoint
router.get('/verify-email', authController.verifyEmailGet); // Email link endpoint

module.exports = router;
