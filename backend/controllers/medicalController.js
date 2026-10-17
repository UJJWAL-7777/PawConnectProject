const MedicalRecord = require('../models/MedicalRecord');
const Pet = require('../models/Pet');

// @desc    Add medical record for a pet
// @route   POST /api/v1/medical-records
// @access  Private (Owner, Rescuer, Admin)
const addMedicalRecord = async (req, res, next) => {
  try {
    const { petId, vetName, clinicName, treatment, diagnosis, medications, documents, notes, cost, date } = req.body;

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    // Check authorization: must be owner, shelter admin, or platform admin
    if (
      pet.ownerId &&
      pet.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add medical records for this pet',
      });
    }

    const record = await MedicalRecord.create({
      petId,
      vetName,
      clinicName: clinicName || 'Community Veterinary Clinic',
      treatment,
      diagnosis: diagnosis || '',
      medications: medications || [],
      documents: documents || [],
      notes: notes || '',
      cost: cost || 0,
      date: date || new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Medical record added successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medical records for a pet
// @route   GET /api/v1/medical-records/pet/:petId
// @access  Public
const getMedicalRecordsByPet = async (req, res, next) => {
  try {
    const records = await MedicalRecord.find({ petId: req.params.petId }).sort({
      date: -1,
    });

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medical record
// @route   DELETE /api/v1/medical-records/:id
// @access  Private (Owner, Admin)
const deleteMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    const pet = await Pet.findById(record.petId);
    if (
      pet &&
      pet.ownerId &&
      pet.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this medical record',
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Medical record deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addMedicalRecord,
  getMedicalRecordsByPet,
  deleteMedicalRecord,
};
