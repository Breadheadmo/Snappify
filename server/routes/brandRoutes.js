const express = require('express');
const router = express.Router();
const {
  getBrands,
  getBrandsAdmin,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getBrands);
router.get('/:id', getBrandById);

// Admin routes
router.get('/admin/all', protect, admin, getBrandsAdmin);
router.post('/', protect, admin, createBrand);
router.put('/:id', protect, admin, updateBrand);
router.delete('/:id', protect, admin, deleteBrand);

module.exports = router;
