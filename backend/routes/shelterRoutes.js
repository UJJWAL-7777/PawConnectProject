const express = require('express');
const {
  getShelters,
  getShelterById,
  createShelter,
  updateShelter,
} = require('../controllers/shelterController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getShelters)
  .post(protect, authorize('Admin', 'ShelterAdmin'), createShelter);

router.route('/:id')
  .get(getShelterById)
  .put(protect, authorize('Admin', 'ShelterAdmin'), updateShelter);

module.exports = router;
