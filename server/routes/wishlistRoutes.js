const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistItem,
} = require('../controllers/wishlistController');

// All wishlist routes require authentication
router.route('/')
  .get(protect, getWishlist)
  .post(protect, addToWishlist)
  .delete(protect, clearWishlist);

router.route('/check/:productId')
  .get(protect, checkWishlistItem);

router.route('/:productId')
  .delete(protect, removeFromWishlist);

module.exports = router;
