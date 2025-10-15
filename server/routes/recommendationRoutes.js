const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRecommendations,
  getRelatedProducts,
  getTrendingProducts,
  getFrequentlyBoughtTogether,
  recordProductView,
} = require('../controllers/recommendationController');

// Get personalized recommendations (requires auth)
router.route('/')
  .get(protect, getRecommendations);

// Get related products for a specific product (public)
router.route('/product/:id')
  .get(getRelatedProducts);

// Get trending products (public)
router.route('/trending')
  .get(getTrendingProducts);

// Get frequently bought together products (public)
router.route('/frequently-bought/:id')
  .get(getFrequentlyBoughtTogether);

// Record product view (requires auth)
router.route('/view')
  .post(protect, recordProductView);

module.exports = router;