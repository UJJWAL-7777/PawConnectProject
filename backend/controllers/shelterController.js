const Shelter = require('../models/Shelter');
const Pet = require('../models/Pet');

// @desc    Get all shelters
// @route   GET /api/v1/shelters
// @access  Public
const getShelters = async (req, res, next) => {
  try {
    const shelters = await Shelter.find()
      .populate('adminIds', 'name email phone avatar')
      .sort('name');

    res.json({
      success: true,
      data: shelters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single shelter by ID
// @route   GET /api/v1/shelters/:id
// @access  Public
const getShelterById = async (req, res, next) => {
  try {
    const shelter = await Shelter.findById(req.params.id).populate(
      'adminIds',
      'name email phone avatar'
    );

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: 'Shelter not found',
      });
    }

    const pets = await Pet.find({ shelterId: shelter._id, status: 'Available' });

    res.json({
      success: true,
      data: {
        ...shelter.toObject(),
        pets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a shelter
// @route   POST /api/v1/shelters
// @access  Private (Admin)
const createShelter = async (req, res, next) => {
  try {
    const shelterData = { ...req.body };
    if (!shelterData.adminIds || shelterData.adminIds.length === 0) {
      shelterData.adminIds = [req.user._id];
    }

    const shelter = await Shelter.create(shelterData);
    res.status(201).json({
      success: true,
      data: shelter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a shelter
// @route   PUT /api/v1/shelters/:id
// @access  Private (ShelterAdmin, Admin)
const updateShelter = async (req, res, next) => {
  try {
    const shelter = await Shelter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: 'Shelter not found',
      });
    }

    res.json({
      success: true,
      data: shelter,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShelters,
  getShelterById,
  createShelter,
  updateShelter,
};
