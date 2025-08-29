const express = require('express');
const router = express.Router();
const {
  createCoupon,
  validateCoupon,
  applyCoupon,
} = require('../controllers/couponController');

// Create a new coupon
router.post('/', createCoupon);
// Validate a coupon
router.post('/validate', validateCoupon);
// Apply a coupon and get discount
router.post('/apply', applyCoupon);

module.exports = router;
