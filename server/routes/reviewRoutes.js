const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

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

    const existingReview = await Review.findOne({ user: req.userId, product: productObjectId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: req.userId,
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
      .populate('user', 'username orderHistory')
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      // Check if the user has purchased this product
      const hasPurchased = review.user?.orderHistory?.some(order =>
        order.productId === productId || // Custom ID
        (order.productId && order.productId.toString() === productObjectId.toString()) // ObjectId
      );
      reviewObj.isVerifiedBuyer = !!hasPurchased;
      // Strip sensitive data from populated user
      if (reviewObj.user) {
        delete reviewObj.user.orderHistory;
      }
      return reviewObj;
    });

    res.json(formattedReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Get top rated reviews (for Client Stories page)
router.get('/top', async (req, res) => {
  try {
    const reviews = await Review.find({ rating: { $gte: 4 } })
      .populate('user', 'username')
      .populate('product', 'name image') // Show which product they reviewed
      .limit(6)
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top reviews', error: error.message });
  }
});

// Admin: Delete a review
router.delete('/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

// Get all reviews (Admin)
router.get('/', authMiddleware, adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

module.exports = router;
