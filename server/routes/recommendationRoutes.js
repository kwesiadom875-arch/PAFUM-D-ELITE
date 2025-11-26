const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/user/:userId', verifyToken, productController.getRecommendationsByUser);
router.get('/product/:productId', productController.getRecommendationsByProduct);

module.exports = router;
