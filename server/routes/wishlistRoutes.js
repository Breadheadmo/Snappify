const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require('../controllers/userController');

// All wishlist routes require authentication
router.route('/')
  .get(protect, getWishlist)
  .post(protect, addToWishlist);

router.route('/:productId')
  .delete(protect, removeFromWishlist);

module.exports = router;
