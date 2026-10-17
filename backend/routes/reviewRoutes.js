const express = require('express');
const { addReview, getSellerReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, addReview);
router.get('/seller/:sellerId', getSellerReviews);

module.exports = router;
