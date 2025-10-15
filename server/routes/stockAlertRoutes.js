const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getStockAlerts,
  createStockAlert,
  updateStockAlert,
  deleteStockAlert,
  checkAllProductsStock,
  getStockStats,
  resolveMultipleAlerts,
} = require('../controllers/stockAlertController');

// All stock alert routes require admin authentication
router.use(protect, admin);

// Stock alerts CRUD
router.route('/')
  .get(getStockAlerts)
  .post(createStockAlert);

router.route('/:id')
  .put(updateStockAlert)
  .delete(deleteStockAlert);

// Bulk operations
router.route('/check-all')
  .post(checkAllProductsStock);

router.route('/resolve-multiple')
  .put(resolveMultipleAlerts);

// Statistics
router.route('/stats')
  .get(getStockStats);

module.exports = router;