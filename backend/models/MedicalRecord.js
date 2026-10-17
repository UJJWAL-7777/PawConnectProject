const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, 'Pet ID is required'],
    },
    vetName: {
      type: String,
      required: [true, 'Veterinarian name is required'],
      trim: true,
    },
    clinicName: {
      type: String,
      trim: true,
      default: 'Community Animal Clinic',
    },
    treatment: {
      type: String,
      required: [true, 'Treatment details are required'],
      trim: true,
    },
    diagnosis: {
      type: String,
      default: '',
    },
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    documents: [String],
    notes: {
      type: String,
      default: '',
    },
    cost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

medicalRecordSchema.index({ petId: 1, date: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
