const asyncHandler = require('../middleware/asyncHandler');
const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'name images price originalPrice brand category rating numReviews inStock countInStock',
    });

  if (!wishlist) {
    return res.json({ items: [] });
  }

  res.json({ items: wishlist.items });
});

/**
 * @desc    Add item to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId, variant } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    // Create new wishlist
    wishlist = new Wishlist({
      user: req.user._id,
      items: [],
    });
  }

  // Check if item already exists in wishlist
  const existingItemIndex = wishlist.items.findIndex(
    (item) => 
      item.product.toString() === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant || {})
  );

  if (existingItemIndex > -1) {
    // Item already exists, remove it (toggle behavior)
    wishlist.items.splice(existingItemIndex, 1);
    await wishlist.save();

    // Populate and return updated wishlist
    await wishlist.populate({
      path: 'items.product',
      select: 'name images price originalPrice brand category rating numReviews inStock countInStock',
    });

    return res.json({ 
      message: 'Item removed from wishlist',
      wishlist,
      action: 'removed'
    });
  }

  // Add item to wishlist
  wishlist.items.push({
    product: productId,
    variant: variant || {},
  });

  await wishlist.save();

  // Populate and return updated wishlist
  await wishlist.populate({
    path: 'items.product',
    select: 'name images price originalPrice brand category rating numReviews inStock countInStock',
  });

  res.status(201).json({
    message: 'Item added to wishlist',
    wishlist,
    action: 'added'
  });
});

/**
 * @desc    Remove item from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variant } = req.query;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  const variantObj = variant ? JSON.parse(variant) : {};

  // Remove item by productId and variant
  const initialLength = wishlist.items.length;
  wishlist.items = wishlist.items.filter(
    (item) => !(
      item.product.toString() === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variantObj)
    )
  );

  if (wishlist.items.length === initialLength) {
    res.status(404);
    throw new Error('Item not found in wishlist');
  }

  await wishlist.save();

  // Populate and return updated wishlist
  await wishlist.populate({
    path: 'items.product',
    select: 'name images price originalPrice brand category rating numReviews inStock countInStock',
  });

  res.json(wishlist);
});

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  wishlist.items = [];
  await wishlist.save();

  res.json({ message: 'Wishlist cleared' });
});

/**
 * @desc    Check if item is in wishlist
 * @route   GET /api/wishlist/check/:productId
 * @access  Private
 */
const checkWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variant } = req.query;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return res.json({ inWishlist: false });
  }

  const variantObj = variant ? JSON.parse(variant) : {};
  const isInWishlist = wishlist.items.some(
    (item) => 
      item.product.toString() === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variantObj)
  );

  res.json({ inWishlist: isInWishlist });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistItem,
};