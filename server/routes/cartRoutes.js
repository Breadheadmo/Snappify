const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

/**
 * Helper function to clean cart items and remove invalid references
 */
const cleanCartItems = async (cart) => {
  const originalItemsCount = cart.items.length;
  
  // Filter out items where product population failed (null products)
  cart.items = cart.items.filter(item => {
    if (!item.product || item.product === null) {
      console.log('Removing cart item with null product reference');
      return false;
    }
    return true;
  });
  
  // If items were removed, recalculate total and save
  if (cart.items.length < originalItemsCount) {
    console.log(`Cleaned ${originalItemsCount - cart.items.length} invalid items from cart`);
    cart.calculateTotalPrice();
    await cart.save();
  }
  
  return cart;
};

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart/items
 * @access  Private
 */
router.get('/items', protect, asyncHandler(async (req, res) => {
  try {
    console.log('Getting cart for user:', req.user ? req.user._id : 'No user');
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Find user's active cart
    let cart = await Cart.findOne({ 
      user: req.user._id, 
      isActive: true 
    }).populate('items.product', 'id name price images inStock countInStock');
    
    // If no cart exists, create an empty one
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalPrice: 0
      });
      await cart.save();
    } else {
      // Clean any invalid cart items
      cart = await cleanCartItems(cart);
    }
    
    // Format the response to match frontend expectations
    const formattedItems = cart.items
      .filter(item => item.product && item.product !== null)
      .map(item => {
        let imageUrl = '/images/placeholder.jpg';
        if (item.product.images && item.product.images.length > 0) {
          imageUrl = item.product.images[0];
        }
        // If imageUrl is not a Cloudinary URL, fallback to placeholder
        if (imageUrl && typeof imageUrl === 'string' && !imageUrl.includes('cloudinary.com')) {
          imageUrl = '/images/placeholder.jpg';
        }
        return {
          productId: item.product.id || item.product._id,
          name: item.product.name,
          price: item.price,
          image: imageUrl,
          inStock: item.product.inStock,
          countInStock: item.product.countInStock,
          quantity: item.quantity
        };
      })
      .filter(item => item !== null);
    
    // Remove items with null products from the cart and save (this should already be done by cleanCartItems)
    const currentItemsCount = cart.items.length;
    cart.items = cart.items.filter(item => item.product && item.product !== null);
    
    if (cart.items.length < currentItemsCount) {
      console.log(`Additional cleanup: Removed ${currentItemsCount - cart.items.length} items with null products`);
      cart.calculateTotalPrice();
      await cart.save();
    }
    
    console.log(`Returning cart for user ${req.user._id}: ${formattedItems.length} items`);
    
    res.json({
      items: formattedItems,
      total: cart.totalPrice || 0
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    
    // If it's a cart-related error, try to return empty cart instead of error
    if (error.message && error.message.includes('Cannot read properties of null')) {
      console.log('Returning empty cart due to null reference error');
      return res.json({
        items: [],
        total: 0
      });
    }
    
    res.status(500).json({ 
      message: 'Error fetching cart data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/items
 * @access  Private
 */
router.post('/items', protect, asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  console.log(`Adding to cart - ProductId: ${productId}, Quantity: ${quantity}, User: ${req.user._id}`);
  
  try {
    // Validate product - handle both numeric IDs and ObjectId strings
    let product;
    
    // First check if productId is a valid ObjectId format (24 character hex string)
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(productId)) {
      try {
        product = await Product.findById(productId);
      } catch (error) {
        console.log('Error finding by ObjectId:', error.message);
      }
    }
    
    // If not found and productId is numeric, try finding by numeric ID field
    if (!product && !isNaN(productId)) {
      product = await Product.findOne({ id: Number(productId) });
    }
    
    if (!product) {
      console.log(`Product not found: ${productId}`);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log(`Product found: ${product.name} (ID: ${product._id}, NumericID: ${product.id})`);
    
    // Check stock
    if (!product.inStock || quantity > product.countInStock) {
      return res.status(400).json({ message: 'Not enough items in stock' });
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
    
    // Check if item already in cart (compare using MongoDB ObjectId)
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === product._id.toString()
    );
    
    if (itemIndex > -1) {
      // Update existing item quantity
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      
      // Check if total quantity exceeds stock
      if (newQuantity > product.countInStock) {
        cart.items[itemIndex].quantity = product.countInStock;
      } else {
        cart.items[itemIndex].quantity = newQuantity;
      }
      
      console.log(`Updated existing cart item to quantity: ${cart.items[itemIndex].quantity}`);
    } else {
      // Add new item to cart
      cart.items.push({
        product: product._id, // Always use MongoDB's ObjectId
        quantity: Math.min(quantity, product.countInStock),
        price: product.price
      });
      
      console.log(`Added new item to cart with quantity: ${quantity}`);
    }
    
    // Calculate total price before saving
    cart.calculateTotalPrice();
    
    // Save cart
    const savedCart = await cart.save();
    
    const totalItems = savedCart.items.reduce((acc, item) => acc + item.quantity, 0);
    
    console.log(`Cart updated - Items: ${savedCart.items.length}, Total Items: ${totalItems}`);
    
    res.status(201).json({ 
      message: 'Item added to cart successfully',
      cartSize: savedCart.items.length,
      totalItems: totalItems,
      totalPrice: savedCart.totalPrice
    });
    
  } catch (error) {
    console.error('Error adding item to cart:', error.message, error.stack);
    res.status(500).json({ message: 'Internal server error while adding to cart' });
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
    if (!item.productId) {
      // Skip items without productId
      itemsChanged = true;
      continue;
    }
    
    const product = await Product.findById(item.productId);
    
    if (product && product.inStock) {
      const validatedItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg',
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
      // Product no longer exists or is out of stock
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
