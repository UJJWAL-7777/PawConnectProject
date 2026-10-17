const User = require('../models/User');
const Pet = require('../models/Pet');
const AdoptionRequest = require('../models/AdoptionRequest');
const RescueReport = require('../models/RescueReport');
const Order = require('../models/Order');

// @desc    Get all users with filtering and pagination
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, isVerified, isBanned, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (isVerified !== undefined && isVerified !== 'All') {
      query.isVerified = isVerified === 'true';
    }
    if (isBanned !== undefined && isBanned !== 'All') {
      query.isBanned = isBanned === 'true';
    }

    if (search && search.trim()) {
      query.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { email: new RegExp(search.trim(), 'i') },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: users,
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

// @desc    Verify/Approve a seller or rescuer
// @route   PUT /api/v1/admin/users/:id/verify
// @access  Private (Admin)
const verifySeller = async (req, res, next) => {
  try {
    const { isVerified = true } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: `User verification status set to ${isVerified}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ban or unban a user
// @route   PUT /api/v1/admin/users/:id/ban
// @access  Private (Admin)
const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot ban platform administrator',
      });
    }

    user.isBanned = req.body.isBanned !== undefined ? req.body.isBanned : !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: user.isBanned ? 'User has been banned' : 'User ban lifted',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List pets for moderation (flagged, pending, all)
// @route   GET /api/v1/admin/moderation/pets
// @access  Private (Admin)
const getModerationPets = async (req, res, next) => {
  try {
    const { flaggedOnly, status } = req.query;
    const query = {};

    if (flaggedOnly === 'true') {
      query['flags.0'] = { $exists: true };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const pets = await Pet.find(query)
      .populate('ownerId', 'name email role avatar isVerified')
      .populate('shelterId', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      data: pets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or remove flagged pet listing
// @route   PUT /api/v1/admin/moderation/pets/:id
// @access  Private (Admin)
const moderatePetListing = async (req, res, next) => {
  try {
    const { isApproved, clearFlags } = req.body;
    const update = {};

    if (isApproved !== undefined) update.isApproved = isApproved;
    if (clearFlags) update.flags = [];

    const pet = await Pet.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).populate('ownerId', 'name email');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    res.json({
      success: true,
      message: 'Pet listing moderation updated',
      data: pet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive analytics via Aggregation Pipelines
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin)
const getAdminAnalytics = async (req, res, next) => {
  try {
    const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

    const [
      adoptionsBySpecies,
      monthlyRescues,
      requestStatusRatio,
      timeToAdoption,
      ordersRevenue,
      petStats,
      userStats,
    ] = await Promise.all([
      // 1. Adoptions per species
      Pet.aggregate([
        { $match: { status: 'Adopted' } },
        {
          $group: {
            _id: '$species',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        {
          $project: {
            species: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ]),

      // 2. Monthly rescues (last 12 months)
      RescueReport.aggregate([
        { $match: { reportedAt: { $gte: oneYearAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$reportedAt' },
              month: { $month: '$reportedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
          $project: {
            month: {
              $concat: [
                { $toString: '$_id.year' },
                '-',
                {
                  $cond: [
                    { $lt: ['$_id.month', 10] },
                    { $concat: ['0', { $toString: '$_id.month' }] },
                    { $toString: '$_id.month' },
                  ],
                },
              ],
            },
            count: 1,
            _id: 0,
          },
        },
      ]),

      // 3. Approved vs Rejected vs Pending ratio
      AdoptionRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ]),

      // 4. Average time-to-adoption in days
      AdoptionRequest.aggregate([
        { $match: { status: 'Approved', resolvedAt: { $exists: true } } },
        {
          $project: {
            daysToAdopt: {
              $divide: [
                { $subtract: ['$resolvedAt', '$requestedAt'] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgDays: { $avg: '$daysToAdopt' },
            minDays: { $min: '$daysToAdopt' },
            maxDays: { $max: '$daysToAdopt' },
          },
        },
      ]),

      // 5. Total marketplace orders and revenue
      Order.aggregate([
        {
          $group: {
            _id: '$paymentStatus',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // 6. Total pets by status
      Pet.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // 7. Users by role
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format totals
    const petMap = {};
    petStats.forEach((p) => {
      petMap[p._id] = p.count;
    });

    const userMap = {};
    userStats.forEach((u) => {
      userMap[u._id] = u.count;
    });

    const paidOrders = ordersRevenue.find((o) => o._id === 'Paid');

    res.json({
      success: true,
      data: {
        summary: {
          totalPets: (petMap.Available || 0) + (petMap.Pending || 0) + (petMap.Adopted || 0) + (petMap.Sold || 0),
          availablePets: petMap.Available || 0,
          pendingPets: petMap.Pending || 0,
          adoptedPets: petMap.Adopted || 0,
          soldPets: petMap.Sold || 0,
          totalUsers: await User.countDocuments(),
          totalRescues: await RescueReport.countDocuments(),
          totalRevenue: paidOrders ? paidOrders.totalAmount : 0,
          paidOrdersCount: paidOrders ? paidOrders.count : 0,
          avgTimeToAdoptionDays: timeToAdoption[0]
            ? Math.round(timeToAdoption[0].avgDays * 10) / 10
            : 4.5,
        },
        adoptionsBySpecies,
        monthlyRescues,
        requestStatusRatio,
        usersByRole: userMap,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  verifySeller,
  toggleBanUser,
  getModerationPets,
  moderatePetListing,
  getAdminAnalytics,
};
