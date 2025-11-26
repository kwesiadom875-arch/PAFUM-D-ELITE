const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Recommendations
router.get('/recommendations/user/:userId', verifyToken, productController.getRecommendationsByUser);
router.get('/recommendations/product/:productId', productController.getRecommendationsByProduct);

module.exports = router;
