const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/productModel');

/**
 * @desc    Validate cart items and return updated information
 * @route   POST /api/cart/validate
 * @access  Public
 */
router.post('/validate', asyncHandler(async (req, res) => {
  const { items } = req.body;
  
  if (!items || !Array.isArray(items)) {
    res.status(400);
    throw new Error('Invalid cart data');
  }
  
  const validatedItems = [];
  let itemsChanged = false;
  
  // Check each product in cart and update with current information
  for (const item of items) {
    const product = await Product.findById(item.productId);
    
    if (product) {
      const validatedItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        inStock: product.inStock,
        countInStock: product.countInStock,
        quantity: Math.min(item.quantity, product.countInStock)
      };
      
      // Check if anything has changed
      if (
        validatedItem.price !== item.price ||
        validatedItem.inStock !== item.inStock ||
        validatedItem.quantity !== item.quantity
      ) {
        itemsChanged = true;
      }
      
      validatedItems.push(validatedItem);
    } else {
      // Product no longer exists
      itemsChanged = true;
    }
  }
  
  res.json({
    items: validatedItems,
    itemsChanged,
  });
}));

/**
 * @desc    Get shipping options
 * @route   GET /api/cart/shipping-options
 * @access  Public
 */
router.get('/shipping-options', (req, res) => {
  const shippingOptions = [
    { id: 'standard', name: 'Standard Delivery', price: 50, description: '3-5 business days' },
    { id: 'express', name: 'Express Delivery', price: 100, description: '1-2 business days' },
    { id: 'same-day', name: 'Same Day Delivery', price: 200, description: 'Delivered today (order before 10am)' }
  ];
  
  res.json(shippingOptions);
});

module.exports = router;
