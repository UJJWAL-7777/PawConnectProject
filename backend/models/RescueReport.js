const mongoose = require('mongoose');

const rescueReportSchema = new mongoose.Schema(
  {
    reporterName: {
      type: String,
      required: [true, 'Reporter name is required'],
      trim: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reporterPhone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
      address: {
        type: String,
        trim: true,
        default: 'Location provided via GPS',
      },
      city: {
        type: String,
        default: '',
      },
      state: {
        type: String,
        default: '',
      },
    },
    animalCondition: {
      type: String,
      required: [true, 'Animal condition is required'],
      enum: ['Critical', 'Injured', 'Healthy', 'Unknown'],
      default: 'Unknown',
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    species: {
      type: String,
      enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other', 'Unknown'],
      default: 'Unknown',
    },
    photos: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['Reported', 'In-Progress', 'Rescued', 'Closed'],
        message: 'Status must be Reported, In-Progress, Rescued, or Closed',
      },
      default: 'Reported',
    },
    assignedVolunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    reportedAt: {
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

rescueReportSchema.index({ status: 1 });
rescueReportSchema.index({ reportedAt: -1 });
rescueReportSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('RescueReport', rescueReportSchema);
