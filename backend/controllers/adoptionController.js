const AdoptionRequest = require('../models/AdoptionRequest');
const Pet = require('../models/Pet');
const User = require('../models/User');
const { sendAdoptionStatusEmail } = require('../utils/emailService');

// @desc    Create adoption request
// @route   POST /api/v1/adoption-requests
// @access  Private (Adopter, Seller, Rescuer)
const createRequest = async (req, res, next) => {
  try {
    const { petId, message, applicantInfo } = req.body;

    // Check if pet exists and is available
    const pet = await Pet.findById(petId).populate('ownerId');
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    if (pet.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'This pet is not currently available for adoption',
      });
    }

    // Check for existing pending request from same user for same pet
    const existingRequest = await AdoptionRequest.findOne({
      userId: req.user._id,
      petId,
      status: 'Pending',
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending adoption application for this pet',
      });
    }

    const request = await AdoptionRequest.create({
      userId: req.user._id,
      petId,
      sellerId: pet.ownerId?._id || pet.ownerId || null,
      message: message || '',
      applicantInfo: applicantInfo || {
        phone: req.user.phone || '',
        residenceType: 'House',
        hasYard: true,
        hasOtherPets: false,
        experienceYears: 2,
      },
    });

    // Update pet status to Pending
    pet.status = 'Pending';
    await pet.save();

    const populatedRequest = await AdoptionRequest.findById(request._id)
      .populate('userId', 'name email phone avatar')
      .populate('petId', 'name species breed photos price listingType status')
      .populate('sellerId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Adoption application submitted successfully',
      data: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get adoption requests (user's sent requests or all for admin)
// @route   GET /api/v1/adoption-requests/mine
// @access  Private
const getRequests = async (req, res, next) => {
  try {
    const query = {};

    // Adopter sees their own; Admin can see all if no filter
    if (req.user.role !== 'Admin') {
      query.userId = req.user._id;
    }

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    const requests = await AdoptionRequest.find(query)
      .populate('userId', 'name email phone avatar')
      .populate('petId', 'name species breed photos status listingType price')
      .populate('sellerId', 'name email phone')
      .sort('-requestedAt');

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get received adoption requests for seller's / rescuer's listings
// @route   GET /api/v1/adoption-requests/received
// @access  Private (Seller, Rescuer, ShelterAdmin, Admin)
const getReceivedRequests = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'Admin') {
      // Admin can view all received requests
      if (req.query.status && req.query.status !== 'All') {
        query.status = req.query.status;
      }
    } else {
      // Find all pets belonging to this user
      const userPets = await Pet.find({ ownerId: req.user._id }).select('_id');
      const petIds = userPets.map((p) => p._id);

      query = {
        $or: [{ sellerId: req.user._id }, { petId: { $in: petIds } }],
      };

      if (req.query.status && req.query.status !== 'All') {
        query.status = req.query.status;
      }
    }

    const requests = await AdoptionRequest.find(query)
      .populate('userId', 'name email phone avatar address')
      .populate('petId', 'name species breed photos status price')
      .sort('-requestedAt');

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update adoption request status (Approve / Reject)
// @route   PUT /api/v1/adoption-requests/:id/status
// @access  Private (Owner, Seller, Rescuer, ShelterAdmin, Admin)
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Approved or Rejected',
      });
    }

    const request = await AdoptionRequest.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('petId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found',
      });
    }

    // Verify user is authorized (pet owner or admin)
    const isOwner =
      request.petId?.ownerId &&
      request.petId.ownerId.toString() === req.user._id.toString();
    const isSeller =
      request.sellerId && request.sellerId.toString() === req.user._id.toString();

    if (!isOwner && !isSeller && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review requests for this pet',
      });
    }

    request.status = status;
    request.resolvedAt = Date.now();
    if (rejectionReason) {
      request.rejectionReason = rejectionReason;
    }
    await request.save();

    // If approved, update pet status to Adopted and add to user's adoptedPets
    if (status === 'Approved') {
      await Pet.findByIdAndUpdate(request.petId._id, { status: 'Adopted' });
      await User.findByIdAndUpdate(request.userId._id, {
        $addToSet: { adoptedPets: request.petId._id },
      });

      // Reject other pending applications for this pet
      await AdoptionRequest.updateMany(
        {
          petId: request.petId._id,
          _id: { $ne: request._id },
          status: 'Pending',
        },
        {
          status: 'Rejected',
          resolvedAt: Date.now(),
          rejectionReason: 'Pet has been adopted by another applicant.',
        }
      );
    }

    // If rejected, set pet back to Available if no other pending requests
    if (status === 'Rejected') {
      const otherPending = await AdoptionRequest.countDocuments({
        petId: request.petId._id,
        _id: { $ne: request._id },
        status: 'Pending',
      });
      if (otherPending === 0) {
        await Pet.findByIdAndUpdate(request.petId._id, { status: 'Available' });
      }
    }

    // Send email notification
    if (request.userId?.email) {
      await sendAdoptionStatusEmail(
        request.userId.email,
        request.userId.name,
        request.petId.name,
        status,
        rejectionReason
      );
    }

    const updatedRequest = await AdoptionRequest.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('petId', 'name species breed photos status');

    res.json({
      success: true,
      message: `Adoption request ${status.toLowerCase()}`,
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getReceivedRequests,
  updateRequestStatus,
};
