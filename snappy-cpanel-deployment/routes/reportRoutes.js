const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getInventoryReport,
  getUserAnalytics,
} = require('../controllers/reportController');

// Sales report
router.get('/sales', getSalesReport);
// Inventory report
router.get('/inventory', getInventoryReport);
// User analytics
router.get('/users', getUserAnalytics);

module.exports = router;
