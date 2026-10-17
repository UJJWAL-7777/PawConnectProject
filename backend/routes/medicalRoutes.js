const express = require('express');
const {
  addMedicalRecord,
  getMedicalRecordsByPet,
  deleteMedicalRecord,
} = require('../controllers/medicalController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('Seller', 'Rescuer', 'ShelterAdmin', 'Admin'),
  addMedicalRecord
);
router.get('/pet/:petId', getMedicalRecordsByPet);
router.delete(
  '/:id',
  protect,
  authorize('Seller', 'Rescuer', 'ShelterAdmin', 'Admin'),
  deleteMedicalRecord
);

module.exports = router;
