const Pet = require('../models/Pet');
const AdoptionRequest = require('../models/AdoptionRequest');
const RescueReport = require('../models/RescueReport');
const User = require('../models/User');

// @desc    Get adoptions grouped by species
// @route   GET /api/stats/adoptions-by-species
// @access  Private (Admin)
const getAdoptionsBySpecies = async (req, res, next) => {
  try {
    const stats = await Pet.aggregate([
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
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all aggregations in parallel
    const [
      petStats,
      requestStats,
      rescuesByMonth,
      adoptionsByMonth,
      speciesDistribution,
      avgTimeToAdoption,
      recentAdoptions,
    ] = await Promise.all([
      // Total pets by status
      Pet.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Adoption request status distribution
      AdoptionRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Rescues by month (last 12 months)
      RescueReport.aggregate([
        {
          $match: {
            reportedAt: {
              $gte: new Date(
                new Date().setFullYear(new Date().getFullYear() - 1)
              ),
            },
          },
        },
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

      // Adoptions by month (last 12 months)
      AdoptionRequest.aggregate([
        {
          $match: {
            status: 'Approved',
            resolvedAt: {
              $gte: new Date(
                new Date().setFullYear(new Date().getFullYear() - 1)
              ),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$resolvedAt' },
              month: { $month: '$resolvedAt' },
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

      // Species distribution (all pets)
      Pet.aggregate([
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

      // Average time to adoption (in days)
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
          },
        },
      ]),

      // Recent adoptions count
      AdoptionRequest.countDocuments({ status: 'Approved' }),
    ]);

    // Format pet stats
    const petStatusMap = {};
    petStats.forEach((s) => {
      petStatusMap[s._id] = s.count;
    });

    const requestStatusMap = {};
    requestStats.forEach((s) => {
      requestStatusMap[s._id] = s.count;
    });

    const totalUsers = await User.countDocuments();
    const totalRescues = await RescueReport.countDocuments();

    res.json({
      success: true,
      data: {
        overview: {
          totalPets:
            (petStatusMap.Available || 0) +
            (petStatusMap.Pending || 0) +
            (petStatusMap.Adopted || 0) +
            (petStatusMap.Sold || 0),
          availablePets: petStatusMap.Available || 0,
          pendingPets: petStatusMap.Pending || 0,
          adoptedPets: petStatusMap.Adopted || 0,
          soldPets: petStatusMap.Sold || 0,
          totalUsers,
          totalRescues,
          totalAdoptions: recentAdoptions,
          pendingRequests: requestStatusMap.Pending || 0,
          approvedRequests: requestStatusMap.Approved || 0,
          rejectedRequests: requestStatusMap.Rejected || 0,
          avgTimeToAdoption: avgTimeToAdoption[0]
            ? Math.round(avgTimeToAdoption[0].avgDays * 10) / 10
            : 0,
        },
        speciesDistribution,
        adoptionsByMonth,
        rescuesByMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdoptionsBySpecies, getDashboardStats };
