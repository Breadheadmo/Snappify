// Data import script with logging
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Setup logging
const logFile = 'data-import-log.txt';
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

// Clear previous log
fs.writeFileSync(logFile, '');

// Start logging
log('Starting data import script...');

// Load environment variables
dotenv.config();
log('Loaded environment variables');

// Import models
try {
  log('Importing models...');
  const User = require('../models/userModel');
  const Product = require('../models/productModel');
  log('Models imported successfully');

  // Sample products data
  const products = [
    {
      name: 'Wireless Earbuds',
      price: 1299,
      description: 'Premium wireless earbuds with noise cancellation',
      brand: 'SoundWave',
      category: 'Audio',
      countInStock: 15,
      rating: 4.5,
      numReviews: 12,
      images: ['https://via.placeholder.com/650x650?text=Wireless+Earbuds+1'],
      inStock: true
    },
    {
      name: '65" 4K Smart TV',
      price: 11999,
      description: 'Experience stunning clarity with this 65-inch 4K smart TV',
      brand: 'VisionPlus',
      category: 'Electronics',
      countInStock: 5,
      rating: 4.8,
      numReviews: 10,
      images: ['https://via.placeholder.com/650x650?text=Smart+TV+1'],
      inStock: true
    },
    {
      name: 'Smartphone 5G',
      price: 9999,
      description: 'Cutting-edge smartphone with 5G connectivity',
      brand: 'PhoneTech',
      category: 'Electronics',
      countInStock: 20,
      rating: 4.9,
      numReviews: 32,
      images: ['https://via.placeholder.com/650x650?text=Smartphone+1'],
      inStock: true
    }
  ];

  // Sample users data
  const users = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: bcrypt.hashSync('password123', 10),
      isAdmin: true,
    },
    {
      username: 'john',
      email: 'john@example.com',
      password: bcrypt.hashSync('password123', 10),
      isAdmin: false,
    }
  ];

  log('Data prepared');

  // Connect to MongoDB
  log('Connecting to MongoDB...');
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      log('MongoDB connected for data seeding');
      return importData();
    })
    .catch(err => {
      log(`MongoDB connection error: ${err.message}`);
      log(err.stack);
      process.exit(1);
    });

  async function importData() {
    try {
      // Clear existing data
      log('Clearing existing data...');
      await Product.deleteMany({});
      log('Existing products cleared');
      
      // Create users
      log('Importing users...');
      const createdUsers = await User.insertMany(users);
      log(`${createdUsers.length} users imported`);
      
      // Add user reference to products
      const adminUser = createdUsers[0]._id;
      log(`Admin user ID: ${adminUser}`);
      
      const sampleProducts = products.map(product => {
        return { ...product, user: adminUser };
      });
      
      // Import products
      log('Importing products...');
      const createdProducts = await Product.insertMany(sampleProducts);
      log(`${createdProducts.length} products imported successfully`);
      
      // Done
      log('Data import complete!');
      mongoose.connection.close();
      process.exit(0);
    } catch (error) {
      log(`Error importing data: ${error.message}`);
      log(error.stack);
      process.exit(1);
    }
  }
} catch (error) {
  log(`Error in import script: ${error.message}`);
  log(error.stack);
  process.exit(1);
}
