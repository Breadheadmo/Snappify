// Simple data import script
console.log('Starting import script...');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
console.log('Importing User model...');
const User = require('../models/userModel');
console.log('Importing Product model...');
const Product = require('../models/productModel');

// Load environment variables
dotenv.config();

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
    images: ['https://via.placeholder.com/650x650?text=Wireless+Earbuds+1']
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
    images: ['https://via.placeholder.com/650x650?text=Smart+TV+1']
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
    images: ['https://via.placeholder.com/650x650?text=Smartphone+1']
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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected for data seeding');
    importData();
  })
  .catch(err => {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  });

async function importData() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared');
    
    // Create users
    const createdUsers = await User.insertMany(users);
    console.log('Users imported');
    
    // Add user reference to products
    const adminUser = createdUsers[0]._id;
    const sampleProducts = products.map(product => {
      return { ...product, user: adminUser };
    });
    
    // Import products
    await Product.insertMany(sampleProducts);
    console.log('Products imported successfully');
    
    // Done
    console.log('Data import complete!');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
}
