const express = require('express');
const {
  createOrder,
  confirmPayment,
  getMyOrders,
  getReceivedOrders,
  getOrderById,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.post('/:id/confirm-payment', confirmPayment);
router.get('/mine', getMyOrders);
router.get('/received', authorize('Seller', 'Rescuer', 'ShelterAdmin', 'Admin'), getReceivedOrders);
router.get('/:id', getOrderById);

module.exports = router;
