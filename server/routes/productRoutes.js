const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  markReviewHelpful,
  getProductReviews,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getProductVariants,
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

// Review routes
router.route('/:id/reviews')
  .get(getProductReviews)
  .post(protect, createProductReview);

router.route('/:id/reviews/:reviewId')
  .put(protect, updateProductReview)
  .delete(protect, deleteProductReview);

router.route('/:id/reviews/:reviewId/helpful')
  .put(protect, markReviewHelpful);

// Variant routes
router.route('/:id/variants')
  .get(getProductVariants)
  .post(protect, admin, addProductVariant);

router.route('/:id/variants/:variantId')
  .put(protect, admin, updateProductVariant)
  .delete(protect, admin, deleteProductVariant);

module.exports = router;
