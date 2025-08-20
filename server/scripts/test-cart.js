// Test script for cart functionality
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

// Load environment variables
dotenv.config();

const API_BASE = 'http://localhost:5000/api';
let token = null;
let testUser = null;
let testProduct = null;

// Connect to MongoDB
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Test user login to get token
async function testLogin() {
  try {
    console.log('\n--- Testing Login ---');
    // Find a user to use for testing
    testUser = await User.findOne({ email: 'admin@example.com' });
    
    if (!testUser) {
      throw new Error('Test user not found. Please make sure to seed the database.');
    }
    
    console.log(`Using test user: ${testUser.username} (${testUser.email})`);
    
    // Get a token by logging in
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: 'password123' // Using the default password from our seed script
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      token = data.token;
      console.log('✅ Login successful, received token');
      return true;
    } else {
      console.error('❌ Login failed:', data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error during login test:', error.message);
    return false;
  }
}

// Get a test product
async function getTestProduct() {
  try {
    console.log('\n--- Getting Test Product ---');
    // Find a product to use for testing
    testProduct = await Product.findOne();
    
    if (!testProduct) {
      throw new Error('No products found. Please make sure to seed the database.');
    }
    
    console.log(`Using test product: ${testProduct.name} ($${testProduct.price / 100})`);
    return true;
  } catch (error) {
    console.error('❌ Error getting test product:', error.message);
    return false;
  }
}

// Test adding to cart
async function testAddToCart() {
  try {
    console.log('\n--- Testing Add to Cart ---');
    
    if (!token || !testProduct) {
      console.error('❌ Missing token or test product, skipping test');
      return false;
    }
    
    // Add product to cart
    const response = await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: testProduct._id,
        quantity: 2
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Product added to cart successfully');
      console.log(`Response: ${JSON.stringify(data)}`);
      return true;
    } else {
      console.error('❌ Failed to add product to cart:', data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing add to cart:', error.message);
    return false;
  }
}

// Test getting cart
async function testGetCart() {
  try {
    console.log('\n--- Testing Get Cart ---');
    
    if (!token) {
      console.error('❌ Missing token, skipping test');
      return false;
    }
    
    // Get cart
    const response = await fetch(`${API_BASE}/cart/items`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Cart retrieved successfully');
      console.log(`Items in cart: ${data.items.length}`);
      console.log(`Total price: $${data.total / 100}`);
      
      if (data.items.length > 0) {
        console.log('\nCart Items:');
        data.items.forEach(item => {
          console.log(`- ${item.name} x${item.quantity}: $${item.price / 100} each`);
        });
      } else {
        console.log('Cart is empty');
      }
      
      return true;
    } else {
      console.error('❌ Failed to get cart:', data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing get cart:', error.message);
    return false;
  }
}

// Test updating cart
async function testUpdateCart() {
  try {
    console.log('\n--- Testing Update Cart ---');
    
    if (!token || !testProduct) {
      console.error('❌ Missing token or test product, skipping test');
      return false;
    }
    
    // Update product quantity
    const response = await fetch(`${API_BASE}/cart/items/${testProduct._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quantity: 3
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Cart updated successfully');
      console.log(`New quantity: ${data.itemQuantity}`);
      console.log(`Total items: ${data.totalItems}`);
      console.log(`Total price: $${data.totalPrice / 100}`);
      return true;
    } else {
      console.error('❌ Failed to update cart:', data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing update cart:', error.message);
    return false;
  }
}

// Test removing from cart
async function testRemoveFromCart() {
  try {
    console.log('\n--- Testing Remove from Cart ---');
    
    if (!token || !testProduct) {
      console.error('❌ Missing token or test product, skipping test');
      return false;
    }
    
    // Remove product from cart
    const response = await fetch(`${API_BASE}/cart/items/${testProduct._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Product removed from cart successfully');
      console.log(`Items remaining in cart: ${data.cartSize}`);
      console.log(`Total price: $${data.totalPrice / 100}`);
      return true;
    } else {
      console.error('❌ Failed to remove product from cart:', data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing remove from cart:', error.message);
    return false;
  }
}

// Test clearing cart
async function testClearCart() {
  try {
    console.log('\n--- Testing Clear Cart ---');
    
    if (!token) {
      console.error('❌ Missing token, skipping test');
      return false;
    }
    
    // First add a product to the cart
    await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: testProduct._id,
        quantity: 1
      }),
    });
    
    // Clear cart
    const response = await fetch(`${API_BASE}/cart`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Cart cleared successfully');
      console.log(`Response: ${JSON.stringify(data)}`);
      
      // Verify cart is empty
      const verifyResponse = await fetch(`${API_BASE}/cart/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok && verifyData.items.length === 0) {
        console.log('✅ Verified cart is empty');
        return true;
      } else {
        console.error('❌ Cart is not empty after clearing');
        return false;
      }
    } else {
      console.error('❌ Failed to clear cart:', data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing clear cart:', error.message);
    return false;
  }
}

// Test direct MongoDB cart access (data persistence)
async function testCartPersistence() {
  try {
    console.log('\n--- Testing Cart Persistence ---');
    
    if (!testUser) {
      console.error('❌ Missing test user, skipping test');
      return false;
    }
    
    // Create a cart directly in the database
    let cart = await Cart.findOne({ user: testUser._id, isActive: true });
    
    if (!cart) {
      cart = new Cart({
        user: testUser._id,
        items: [],
        totalPrice: 0
      });
    }
    
    // Add an item to the cart
    cart.items.push({
      product: testProduct._id,
      quantity: 5,
      price: testProduct.price
    });
    
    await cart.save();
    console.log('✅ Added item to cart via MongoDB directly');
    
    // Verify it appears in the API
    const response = await fetch(`${API_BASE}/cart/items`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.items.length > 0) {
      console.log('✅ Verified item appears via API');
      console.log(`Items in cart: ${data.items.length}`);
      console.log(`Total price: $${data.total / 100}`);
      return true;
    } else {
      console.error('❌ Failed to verify cart persistence');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing cart persistence:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('=== CART FUNCTIONALITY TESTS ===');
  
  try {
    const conn = await connectDB();
    
    // Run tests
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      throw new Error('Login test failed, aborting remaining tests');
    }
    
    const productSuccess = await getTestProduct();
    if (!productSuccess) {
      throw new Error('Get test product failed, aborting remaining tests');
    }
    
    await testAddToCart();
    await testGetCart();
    await testUpdateCart();
    await testRemoveFromCart();
    await testClearCart();
    await testCartPersistence();
    
    console.log('\n=== TEST SUMMARY ===');
    console.log('✅ Cart functionality tests completed');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error(`\n❌ Tests failed: ${error.message}`);
    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the tests
runTests();
