const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Add review for a seller/rescuer
// @route   POST /api/v1/reviews
// @access  Private (Adopter, Buyer)
const addReview = async (req, res, next) => {
  try {
    const { sellerId, petId, rating, comment } = req.body;

    if (!sellerId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide sellerId, rating, and comment',
      });
    }

    if (sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot review yourself',
      });
    }

    // Check if seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    const review = await Review.create({
      reviewerId: req.user._id,
      sellerId,
      petId: petId || null,
      rating: Number(rating),
      comment,
    });

    const populated = await Review.findById(review._id)
      .populate('reviewerId', 'name avatar')
      .populate('petId', 'name photos');

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a seller
// @route   GET /api/v1/reviews/seller/:sellerId
// @access  Public
const getSellerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ sellerId: req.params.sellerId })
      .populate('reviewerId', 'name avatar')
      .populate('petId', 'name species breed')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews) *
              10
          ) / 10
        : 5.0;

    res.json({
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addReview, getSellerReviews };
