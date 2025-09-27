const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductCategories,
  getProductBrands,
} = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/')
  .get(getProducts)
  .post(protect, admin, upload.array('images[]', 10), createProduct);

router.get('/top', getTopProducts);
router.get('/categories', getProductCategories);
router.get('/brands', getProductBrands);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.array('images[]', 10), updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/reviews')
  .post(protect, createProductReview);

module.exports = router;
