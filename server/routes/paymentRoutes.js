const express = require('express');
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentById,
  refundPayment
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for payment endpoints
const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment requests per windowMs
  message: {
    error: 'Too many payment requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const verificationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 verification requests per windowMs
  message: {
    error: 'Too many verification requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no auth required)
// Webhook endpoint for Paystack
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);

// Payment initialization with rate limiting
router.post('/initialize', paymentRateLimit, initializePayment);

// Payment verification with rate limiting
router.post('/verify/:reference', verificationRateLimit, verifyPayment);

// Payment history
router.get('/history', getPaymentHistory);

// Get specific payment
router.get('/:id', getPaymentById);

// Admin-only routes
router.use(admin);

// Refund payment (Admin only)
router.post('/:id/refund', refundPayment);

module.exports = router;
