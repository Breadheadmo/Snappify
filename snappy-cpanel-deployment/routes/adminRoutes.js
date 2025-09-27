const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getAnalytics,
  getReports,
  clearAllProducts
} = require('../controllers/adminController');

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(admin);

// Dashboard Routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/reports', getReports);

// User Management Routes
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUserRole)
  .delete(deleteUser);

// Product Management Routes
router.route('/products')
  .get(getAllProducts);

router.route('/products/clear')
  .delete(clearAllProducts);

router.route('/products/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

router.route('/products/:id/stock')
  .put(updateProductStock);

// Order Management Routes
router.route('/orders')
  .get(getAllOrders);

router.route('/orders/:id')
  .get(getOrderById)
  .put(updateOrderStatus)
  .delete(deleteOrder);

module.exports = router;
