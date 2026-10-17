const express = require('express');
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
} = require('../controllers/rescueController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getReports)
  .post(protect, createReport);

router.route('/:id')
  .get(getReportById)
  .put(protect, authorize('Rescuer', 'ShelterAdmin', 'Admin'), updateReport);

module.exports = router;
