const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getLowStockProducts,
  getOutOfStockProducts,
  restockProduct,
} = require('../controllers/inventoryController');

// Get low stock products
router.get('/low-stock', protect, admin, getLowStockProducts);

// Get out-of-stock products
router.get('/out-of-stock', protect, admin, getOutOfStockProducts);

// Restock a product
router.put('/:id/restock', protect, admin, restockProduct);

module.exports = router;
