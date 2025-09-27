const express = require('express');
const router = express.Router();
const {
  updateOrderTracking,
  getOrderTracking,
  trackByNumber,
  bulkUpdateTracking
} = require('../controllers/trackingController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public tracking route
router.get('/:trackingNumber', trackByNumber);

// Protected routes
router.use(protect);

// Get order tracking for user's own orders
router.get('/order/:id', getOrderTracking);

// Admin only routes
router.put('/order/:id', admin, updateOrderTracking);
router.put('/bulk-update', admin, bulkUpdateTracking);

module.exports = router;
