const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart/items
 * @access  Private
 */
router.get('/items', protect, asyncHandler(async (req, res) => {
  // Find user's active cart
  let cart = await Cart.findOne({ 
    user: req.user._id, 
    isActive: true 
  }).populate('items.product', 'name price images inStock countInStock');
  
  // If no cart exists, create an empty one
  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: [],
      totalPrice: 0
    });
    await cart.save();
  }
  
  res.json({
    items: cart.items.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.price,
      image: item.product.images[0],
      inStock: item.product.inStock,
      countInStock: item.product.countInStock,
      quantity: item.quantity
    })),
    total: cart.totalPrice
  });
}));

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/items
 * @access  Private
 */
router.post('/items', protect, asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  try {
    // Validate product - first try regular findById (for ObjectId)
    let product;
    try {
      product = await Product.findById(productId);
    } catch (error) {
      // If productId is not a valid ObjectId, try finding by numeric ID
      if (error.name === 'CastError') {
        product = await Product.findOne({ id: Number(productId) });
      } else {
        throw error;
      }
    }
    
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    // Check stock
    if (quantity > product.countInStock) {
      res.status(400);
      throw new Error('Not enough items in stock');
    }
    
    // Find user's active cart or create a new one
    let cart = await Cart.findOne({ user: req.user._id, isActive: true });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalPrice: 0
      });
    }
    
    // Check if item already in cart
    const itemIndex = cart.items.findIndex(item => {
      const itemProductId = item.product.toString();
      return itemProductId === productId.toString() || 
             itemProductId === String(product._id);
    });
    
    if (itemIndex > -1) {
      // Update existing item
      cart.items[itemIndex].quantity += quantity;
      
      // Check if quantity exceeds stock
      if (cart.items[itemIndex].quantity > product.countInStock) {
        cart.items[itemIndex].quantity = product.countInStock;
      }
    } else {
      // Add new item to cart
      cart.items.push({
        product: product._id, // Use MongoDB's ObjectId
        quantity,
        price: product.price
      });
    }
    
    // Save cart
    await cart.save();
    
    res.status(201).json({ 
      message: 'Item added to cart',
      cartSize: cart.items.length,
      totalItems: cart.items.reduce((acc, item) => acc + item.quantity, 0)
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: error.message || 'Error adding item to cart' });
  }
}));

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/items/:productId
 * @access  Private
 */
router.put('/items/:productId', protect, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  
  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }
  
  // Find user's cart
  const cart = await Cart.findOne({ user: req.user._id, isActive: true });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  
  // Find item in cart
  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId.toString());
  
  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }
  
  // Check product stock
  let product;
  try {
    product = await Product.findById(productId);
  } catch (error) {
    // If productId is not a valid ObjectId, try finding by numeric ID
    if (error.name === 'CastError') {
      product = await Product.findOne({ id: Number(productId) });
    } else {
      throw error;
    }
  }
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Update quantity, limited by stock
  cart.items[itemIndex].quantity = Math.min(quantity, product.countInStock);
  
  // Save cart
  await cart.save();
  
  res.json({ 
    message: 'Cart updated',
    itemQuantity: cart.items[itemIndex].quantity,
    totalItems: cart.items.reduce((acc, item) => acc + item.quantity, 0),
    totalPrice: cart.totalPrice
  });
}));

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:productId
 * @access  Private
 */
router.delete('/items/:productId', protect, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  // Find user's cart
  const cart = await Cart.findOne({ user: req.user._id, isActive: true });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  
  // Try to find the product to get its ObjectId
  let product;
  try {
    product = await Product.findById(productId);
  } catch (error) {
    if (error.name === 'CastError') {
      product = await Product.findOne({ id: Number(productId) });
    } else {
      throw error;
    }
  }
  
  // Remove item from cart
  if (product) {
    // If we found the product, use its ID
    cart.items = cart.items.filter(item => 
      item.product.toString() !== product._id.toString()
    );
  } else {
    // Try with the original ID if product not found
    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId.toString()
    );
  }
  
  // Save cart
  await cart.save();
  
  res.json({ 
    message: 'Item removed from cart',
    cartSize: cart.items.length,
    totalPrice: cart.totalPrice
  });
}));

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
router.delete('/', protect, asyncHandler(async (req, res) => {
  // Find user's cart
  const cart = await Cart.findOne({ user: req.user._id, isActive: true });
  if (cart) {
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
  }
  
  res.json({ message: 'Cart cleared' });
}));

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
