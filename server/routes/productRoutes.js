const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);

// Recommendations
router.get('/recommendations/user/:userId', verifyToken, productController.getRecommendationsByUser);
router.get('/recommendations/product/:productId', productController.getRecommendationsByProduct);
router.get('/olfactory-map', productController.getOlfactoryMap);
// Vault (Exclusive Products)
router.get('/vault', verifyToken, productController.getVaultProducts);

router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
