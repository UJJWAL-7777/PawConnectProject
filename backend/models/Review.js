const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller/Rescuer is required'],
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ sellerId: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1, sellerId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
