const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Create a review
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: req.user.userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: req.user.userId,
      product: productId,
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
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name') // Populate user name
      .sort({ createdAt: -1 }); // Newest first
    res.json(reviews);
  } catch (error) {
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
