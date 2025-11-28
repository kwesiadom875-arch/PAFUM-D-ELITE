const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

// All admin routes require verifyToken AND adminAuth
router.use(verifyToken, adminAuth);

router.get('/analytics/summary', adminController.getAnalyticsSummary);
router.get('/analytics/sales-over-time', adminController.getSalesOverTime);
router.get('/users', adminController.getUsers);
router.get('/orders', adminController.getOrders);
router.post('/update-stock', adminController.updateStock);
router.post('/upload-hero-video', adminController.uploadHeroVideo);
router.post('/upload-hero-video', adminController.uploadHeroVideo);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);
router.post('/users', adminController.createUser);
router.get('/testers', adminController.getAllTesters);

module.exports = router;
