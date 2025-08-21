const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  updateCategoryCounts,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategoryById);

// Admin routes
router.get('/admin/all', protect, admin, getCategoriesAdmin);
router.post('/', protect, admin, createCategory);
router.put('/update-counts', protect, admin, updateCategoryCounts);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
