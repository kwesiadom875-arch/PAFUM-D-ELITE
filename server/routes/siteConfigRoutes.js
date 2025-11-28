const express = require('express');
const router = express.Router();
const siteConfigController = require('../controllers/siteConfigController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminAuth');

// Public read access (or restricted if needed, but banners are usually public)
router.get('/:key', siteConfigController.getConfig);

// Admin write access
router.post('/:key', authMiddleware, adminMiddleware, siteConfigController.updateConfig);

module.exports = router;
