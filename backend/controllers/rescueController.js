const RescueReport = require('../models/RescueReport');

// @desc    Create rescue report for stray / injured animal
// @route   POST /api/v1/rescue-reports
// @access  Private (Any authenticated user)
const createReport = async (req, res, next) => {
  try {
    const reportData = {
      ...req.body,
      reporterId: req.user ? req.user._id : null,
      reporterName: req.body.reporterName || req.user?.name || 'Anonymous Good Samaritan',
      reporterPhone: req.body.reporterPhone || req.user?.phone || '',
    };

    // Location coordinates handling
    if (req.body.lat && req.body.lng) {
      reportData.location = {
        lat: Number(req.body.lat),
        lng: Number(req.body.lng),
        address: req.body.address || 'GPS Coordinates',
        city: req.body.city || '',
        state: req.body.state || '',
      };
    }

    const report = await RescueReport.create(reportData);

    res.status(201).json({
      success: true,
      message: 'Rescue report submitted! Nearby rescuers and shelters have been alerted.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rescue reports with filtering
// @route   GET /api/v1/rescue-reports
// @access  Public / Authenticated
const getReports = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    if (req.query.condition && req.query.condition !== 'All') {
      query.animalCondition = req.query.condition;
    }

    if (req.query.species && req.query.species !== 'All') {
      query.species = req.query.species;
    }

    // If user requests only their reports
    if (req.query.mine === 'true' && req.user) {
      query.reporterId = req.user._id;
    }

    const reports = await RescueReport.find(query)
      .populate('reporterId', 'name email phone avatar')
      .populate('assignedVolunteerId', 'name email phone')
      .sort('-reportedAt');

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single rescue report by ID
// @route   GET /api/v1/rescue-reports/:id
// @access  Public
const getReportById = async (req, res, next) => {
  try {
    const report = await RescueReport.findById(req.params.id)
      .populate('reporterId', 'name email phone avatar')
      .populate('assignedVolunteerId', 'name email phone');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rescue report not found',
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update rescue report status / assignment
// @route   PUT /api/v1/rescue-reports/:id
// @access  Private (Rescuer, ShelterAdmin, Admin)
const updateReport = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (updateData.status === 'Rescued' || updateData.status === 'Closed') {
      updateData.resolvedAt = new Date();
    }

    const report = await RescueReport.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('reporterId', 'name email phone')
      .populate('assignedVolunteerId', 'name email phone');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rescue report not found',
      });
    }

    res.json({
      success: true,
      message: 'Rescue report updated successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport, getReports, getReportById, updateReport };
