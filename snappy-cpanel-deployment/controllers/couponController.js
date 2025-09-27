const Coupon = require('../models/couponModel');
const asyncHandler = require('../middleware/asyncHandler');

// Create a new coupon
const createCoupon = asyncHandler(async (req, res) => {
  const { code, type, value, minOrder, maxDiscount, expiresAt, usageLimit } = req.body;
  const coupon = new Coupon({ code, type, value, minOrder, maxDiscount, expiresAt, usageLimit });
  await coupon.save();
  res.status(201).json(coupon);
});

// Validate a coupon
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  const coupon = await Coupon.findOne({ code, active: true });
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found or inactive');
  }
  if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
    res.status(400);
    throw new Error('Coupon expired');
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }
  if (orderTotal < coupon.minOrder) {
    res.status(400);
    throw new Error('Order total does not meet minimum requirement');
  }
  res.json({ valid: true, coupon });
});

// Apply coupon and calculate discount
const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  const coupon = await Coupon.findOne({ code, active: true });
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found or inactive');
  }
  if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
    res.status(400);
    throw new Error('Coupon expired');
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }
  if (orderTotal < coupon.minOrder) {
    res.status(400);
    throw new Error('Order total does not meet minimum requirement');
  }
  let discount = 0;
  if (coupon.type === 'percent') {
    discount = (orderTotal * coupon.value) / 100;
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }
  res.json({ valid: true, discount, coupon });
});

module.exports = { createCoupon, validateCoupon, applyCoupon };
