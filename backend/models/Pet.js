const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vaccination name is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Vaccination date is required'],
    },
    nextDue: {
      type: Date,
    },
  },
  { _id: true }
);

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide pet name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    species: {
      type: String,
      required: [true, 'Please provide species'],
      enum: {
        values: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'],
        message: 'Species must be Dog, Cat, Bird, Rabbit, or Other',
      },
    },
    breed: {
      type: String,
      trim: true,
      default: 'Mixed Breed',
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      default: 1,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Unknown'],
      default: 'Unknown',
    },
    size: {
      type: String,
      enum: ['Small', 'Medium', 'Large', 'Extra Large'],
      default: 'Medium',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
      default: '',
    },
    photos: {
      type: [String],
      default: [],
    },
    listingType: {
      type: String,
      enum: ['adoption', 'sale'],
      default: 'adoption',
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['Available', 'Pending', 'Adopted', 'Sold'],
        message: 'Status must be Available, Pending, Adopted, or Sold',
      },
      default: 'Available',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [-122.4194, 37.7749], // Default: San Francisco
      },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    vaccinations: [vaccinationSchema],
    temperament: {
      type: [String],
      default: ['Friendly', 'Playful'],
    },
    healthNotes: {
      type: String,
      default: 'Healthy and vaccinated',
    },
    rescueStory: {
      type: String,
      maxlength: [2000, 'Rescue story cannot exceed 2000 characters'],
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    flags: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for query optimization
petSchema.index({ species: 1, status: 1, listingType: 1, price: 1 });
petSchema.index({ name: 'text', breed: 'text', description: 'text' });
petSchema.index({ location: '2dsphere' });
petSchema.index({ ownerId: 1 });
petSchema.index({ shelterId: 1 });

module.exports = mongoose.model('Pet', petSchema);
