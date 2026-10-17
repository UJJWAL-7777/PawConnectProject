const express = require('express');
const {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  toggleFavorite,
  getMyFavorites,
  reportPetListing,
  addVaccination,
} = require('../controllers/petController');
const { protect, authorize, verifiedSellerOnly } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getPets)
  .post(protect, authorize('Seller', 'Rescuer', 'ShelterAdmin', 'Admin'), verifiedSellerOnly, createPet);

router.get('/favorites/mine', protect, getMyFavorites);

router.route('/:id')
  .get(getPetById)
  .put(protect, authorize('Seller', 'Rescuer', 'ShelterAdmin', 'Admin'), updatePet)
  .delete(protect, authorize('Seller', 'Rescuer', 'ShelterAdmin', 'Admin'), deletePet);

router.post('/:id/favorite', protect, toggleFavorite);
router.post('/:id/report', protect, reportPetListing);
router.post('/:id/vaccinations', protect, authorize('Seller', 'Rescuer', 'ShelterAdmin', 'Admin'), addVaccination);

module.exports = router;
