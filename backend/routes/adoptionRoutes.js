const express = require('express');
const {
  createRequest,
  getRequests,
  getReceivedRequests,
  updateRequestStatus,
} = require('../controllers/adoptionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createRequest);
router.get('/', getRequests);
router.get('/mine', getRequests);
router.get('/received', authorize('Seller', 'Rescuer', 'ShelterAdmin', 'Admin'), getReceivedRequests);
router.put('/:id/status', authorize('Seller', 'Rescuer', 'ShelterAdmin', 'Admin'), updateRequestStatus);

module.exports = router;
