const Pet = require('../models/Pet');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Review = require('../models/Review');

// Prohibited species for legal / ethical compliance
const PROHIBITED_SPECIES = [
  'tiger',
  'lion',
  'leopard',
  'cheetah',
  'bear',
  'monkey',
  'chimpanzee',
  'ape',
  'wolf',
  'crocodile',
  'alligator',
  'venomous snake',
  'endangered',
];

// @desc    Get all pets with filtering, search, pagination, and sorting
// @route   GET /api/v1/pets
// @access  Public
const getPets = async (req, res, next) => {
  try {
    const {
      species,
      breed,
      status,
      size,
      gender,
      color,
      listingType,
      minAge,
      maxAge,
      minPrice,
      maxPrice,
      search,
      ownerId,
      shelterId,
      lat,
      lng,
      maxDistance = 50000, // 50km in meters
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const query = { isApproved: true };

    // Species
    if (species && species !== 'All') {
      query.species = species;
    }

    // Breed (case-insensitive substring)
    if (breed) {
      query.breed = new RegExp(breed, 'i');
    }

    // Status: default to Available unless specified
    if (status && status !== 'All') {
      query.status = status;
    }

    // Listing Type (adoption | sale)
    if (listingType && listingType !== 'All') {
      query.listingType = listingType;
    }

    // Size & Gender & Color
    if (size && size !== 'All') query.size = size;
    if (gender && gender !== 'All') query.gender = gender;
    if (color) query.color = new RegExp(color, 'i');

    // Owner or Shelter specific
    if (ownerId) query.ownerId = ownerId;
    if (shelterId) query.shelterId = shelterId;

    // Age range
    if (minAge !== undefined || maxAge !== undefined) {
      query.age = {};
      if (minAge !== undefined && minAge !== '') query.age.$gte = Number(minAge);
      if (maxAge !== undefined && maxAge !== '') query.age.$lte = Number(maxAge);
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
    }

    // Text search on name, breed, description
    if (search && search.trim()) {
      query.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { breed: new RegExp(search.trim(), 'i') },
        { description: new RegExp(search.trim(), 'i') },
      ];
    }

    // GeoSpatial query if lat and lng are provided
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance, 10),
        },
      };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    const total = await Pet.countDocuments(query);
    const pets = await Pet.find(query)
      .populate('shelterId', 'name location contactInfo')
      .populate('ownerId', 'name email phone avatar isVerified')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: pets,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single pet by ID
// @route   GET /api/v1/pets/:id
// @access  Public
const getPetById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('shelterId', 'name location contactInfo capacity')
      .populate('ownerId', 'name email phone avatar isVerified role createdAt');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    // Fetch medical records for this pet
    const medicalRecords = await MedicalRecord.find({ petId: pet._id }).sort({
      date: -1,
    });

    // If pet has an owner, fetch owner reviews
    let sellerReviews = [];
    if (pet.ownerId) {
      sellerReviews = await Review.find({ sellerId: pet.ownerId._id })
        .populate('reviewerId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5);
    }

    res.json({
      success: true,
      data: {
        ...pet.toObject(),
        medicalRecords,
        sellerReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new pet listing
// @route   POST /api/v1/pets
// @access  Private (Seller, Rescuer, ShelterAdmin, Admin)
const createPet = async (req, res, next) => {
  try {
    const petData = { ...req.body };

    // Ethics & Legal Check: Disallow prohibited species
    const descText = `${petData.name || ''} ${petData.breed || ''} ${
      petData.description || ''
    }`.toLowerCase();

    for (const prohibited of PROHIBITED_SPECIES) {
      if (descText.includes(prohibited)) {
        return res.status(400).json({
          success: false,
          message: `Ethics violation: Listing of prohibited or protected species (${prohibited}) is strictly banned on PawConnect.`,
        });
      }
    }

    // Set owner
    petData.ownerId = req.user._id;

    // If shelter admin, link shelter
    if (req.user.shelterId && !petData.shelterId) {
      petData.shelterId = req.user.shelterId;
    }

    // Standardize location coordinates if provided as { lat, lng }
    if (petData.location && petData.location.lat && petData.location.lng) {
      petData.location = {
        type: 'Point',
        coordinates: [parseFloat(petData.location.lng), parseFloat(petData.location.lat)],
        address: petData.location.address || '',
        city: petData.location.city || '',
        state: petData.location.state || '',
      };
    }

    const pet = await Pet.create(petData);

    res.status(201).json({
      success: true,
      message: 'Pet listing created successfully',
      data: pet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a pet listing
// @route   PUT /api/v1/pets/:id
// @access  Private (Owner, Admin)
const updatePet = async (req, res, next) => {
  try {
    let pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    // Ensure user is owner or admin
    if (
      pet.ownerId &&
      pet.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing',
      });
    }

    // Handle location formatting if provided
    const updateData = { ...req.body };
    if (updateData.location && updateData.location.lat && updateData.location.lng) {
      updateData.location = {
        type: 'Point',
        coordinates: [
          parseFloat(updateData.location.lng),
          parseFloat(updateData.location.lat),
        ],
        address: updateData.location.address || pet.location?.address || '',
        city: updateData.location.city || pet.location?.city || '',
        state: updateData.location.state || pet.location?.state || '',
      };
    }

    pet = await Pet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Pet listing updated successfully',
      data: pet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a pet listing
// @route   DELETE /api/v1/pets/:id
// @access  Private (Owner, Admin)
const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    if (
      pet.ownerId &&
      pet.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing',
      });
    }

    await pet.deleteOne();

    res.json({
      success: true,
      message: 'Pet listing removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite pet for logged-in user
// @route   POST /api/v1/pets/:id/favorite
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const petId = req.params.id;

    const petExists = await Pet.findById(petId);
    if (!petExists) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    const isFav = user.favorites.some((fav) => fav.toString() === petId.toString());

    if (isFav) {
      user.favorites = user.favorites.filter(
        (fav) => fav.toString() !== petId.toString()
      );
    } else {
      user.favorites.push(petId);
    }

    await user.save();

    res.json({
      success: true,
      isFavorite: !isFav,
      message: !isFav ? 'Added to favorites' : 'Removed from favorites',
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorite pets
// @route   GET /api/v1/pets/favorites/mine
// @access  Private
const getMyFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'shelterId', select: 'name location' },
    });

    res.json({
      success: true,
      data: user.favorites || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report pet listing for moderation
// @route   POST /api/v1/pets/:id/report
// @access  Private
const reportPetListing = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    pet.flags.push({
      userId: req.user._id,
      reason: reason || 'Listing flagged by user',
    });

    // If flagged more than 3 times, auto-hide for review
    if (pet.flags.length >= 3) {
      pet.isApproved = false;
    }

    await pet.save();

    res.json({
      success: true,
      message: 'Listing reported. Our moderation team will review it.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add vaccination to pet
// @route   POST /api/v1/pets/:id/vaccinations
// @access  Private (Owner, Admin)
const addVaccination = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    if (
      pet.ownerId &&
      pet.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify medical records for this pet',
      });
    }

    pet.vaccinations.push(req.body);
    await pet.save();

    res.status(201).json({
      success: true,
      data: pet,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  toggleFavorite,
  getMyFavorites,
  reportPetListing,
  addVaccination,
};
