const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, 'Pet ID is required'],
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: 'Status must be Pending, Approved, or Rejected',
      },
      default: 'Pending',
    },
    message: {
      type: String,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: '',
    },
    applicantInfo: {
      phone: { type: String, default: '' },
      residenceType: { type: String, default: 'House' }, // House, Apartment, Condo
      hasYard: { type: Boolean, default: false },
      hasOtherPets: { type: Boolean, default: false },
      experienceYears: { type: Number, default: 0 },
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
adoptionRequestSchema.index({ userId: 1, petId: 1 });
adoptionRequestSchema.index({ sellerId: 1, status: 1 });
adoptionRequestSchema.index({ status: 1 });

module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema);
