const Review = require('../models/Review');
const { awardPoints } = require('../services/gamificationService');

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, reviewText } = req.body;
    const userId = req.userId;

    const newReview = new Review({
      userId,
      productId,
      rating,
      reviewText,
    });

    await newReview.save();
    await awardPoints(userId, 'review');

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: error.message });
  }
};
