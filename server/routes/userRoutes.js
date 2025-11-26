const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/profile', verifyToken, userController.getProfile);
router.post('/wishlist/add/:productId', verifyToken, userController.addToWishlist);
router.delete('/wishlist/remove/:productId', verifyToken, userController.removeFromWishlist);
router.post('/purchase', verifyToken, userController.recordPurchase);

module.exports = router;
