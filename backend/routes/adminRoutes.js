const express = require('express');
const {
  getUsers,
  verifySeller,
  toggleBanUser,
  getModerationPets,
  moderatePetListing,
  getAdminAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

// Users management
router.get('/users', getUsers);
router.put('/users/:id/verify', verifySeller);
router.put('/users/:id/ban', toggleBanUser);

// Moderation
router.get('/moderation/pets', getModerationPets);
router.put('/moderation/pets/:id', moderatePetListing);

// Analytics
router.get('/analytics', getAdminAnalytics);

module.exports = router;
