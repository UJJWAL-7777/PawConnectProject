const express = require('express');
const router = express.Router();
const {
  getAdoptionsBySpecies,
  getDashboardStats,
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/adoptions-by-species', protect, authorize('Admin'), getAdoptionsBySpecies);
router.get('/dashboard', protect, authorize('Admin'), getDashboardStats);

module.exports = router;
