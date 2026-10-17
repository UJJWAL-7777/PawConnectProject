const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shelter name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [-122.4194, 37.7749],
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: {
        type: String,
        default: '',
      },
      zipCode: {
        type: String,
        default: '',
      },
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    contactInfo: {
      phone: {
        type: String,
        default: '',
      },
      email: {
        type: String,
        default: '',
      },
      website: {
        type: String,
        default: '',
      },
    },
    adminIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    photos: [String],
  },
  {
    timestamps: true,
  }
);

shelterSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Shelter', shelterSchema);
