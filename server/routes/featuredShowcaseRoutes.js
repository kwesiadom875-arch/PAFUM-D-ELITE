const express = require('express');
const router = express.Router();
const FeaturedProducts = require('../models/FeaturedProducts');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminAuth');

// @route   GET /api/featured-showcase
// @desc    Get featured showcase products (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const featured = await FeaturedProducts.getFeatured();
    
    // Return only the products array, limited to 4
    const products = featured.products.slice(0, 4);
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured showcase products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/featured-showcase
// @desc    Set featured showcase products (admin only)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: 'Product IDs must be an array' });
    }
    
    if (productIds.length > 4) {
      return res.status(400).json({ message: 'Maximum 4 products allowed' });
    }
    
    const featured = await FeaturedProducts.setFeatured(productIds, req.userId);
    
    res.json({
      message: 'Featured products updated successfully',
      products: featured.products
    });
  } catch (error) {
    console.error('Error setting featured showcase products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
