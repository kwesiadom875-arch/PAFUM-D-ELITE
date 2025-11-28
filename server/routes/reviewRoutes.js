const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

// Create a review
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if user already reviewed this product
    // Note: productId here might be the custom ID or ObjectId depending on frontend. 
    // Assuming frontend sends custom ID, we need to resolve it.
    let productObjectId = productId;
    
    // Check if it's a valid ObjectId, if not assume it's custom ID
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(productId)) {
       const product = await Product.findOne({ id: productId });
       if (!product) return res.status(404).json({ message: 'Product not found' });
       productObjectId = product._id;
    }

    const existingReview = await Review.findOne({ user: req.user.userId, product: productObjectId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: req.user.userId,
      product: productObjectId,
      rating,
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
});

// Get reviews for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    let productObjectId = productId;

    // If productId is numeric (custom ID), find the _id
    // Or if it's just not a valid ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        const product = await Product.findOne({ id: productId });
        if (!product) {
            // If product not found by custom ID, return empty array or 404
            // Returning empty array is safer for UI
            return res.json([]); 
        }
        productObjectId = product._id;
    }

    const reviews = await Review.find({ product: productObjectId })
      .populate('user', 'name') // Populate user name
      .sort({ createdAt: -1 }); // Newest first
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Get top rated reviews (for Client Stories page)
router.get('/top', async (req, res) => {
  try {
    const reviews = await Review.find({ rating: { $gte: 4 } })
      .populate('user', 'name')
      .populate('product', 'name image') // Show which product they reviewed
      .limit(6)
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top reviews', error: error.message });
  }
});

module.exports = router;
