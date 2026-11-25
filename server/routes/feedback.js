const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');

// @route   POST /api/feedback
// @desc    Submit feedback on an order or food item
// @access  Private (Students & Staff)
router.post('/', protect, async (req, res) => {
  try {
    const { orderNumber, itemReviewed, rating, category, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating (1-5) and comment are required' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      userName: req.user.name,
      orderNumber: orderNumber || '',
      itemReviewed: itemReviewed || 'General Service',
      rating: Number(rating),
      category: category || 'Food Quality',
      comment
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback and average ratings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const reviews = await Feedback.find().sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

    res.json({
      reviews,
      totalReviews,
      avgRating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

