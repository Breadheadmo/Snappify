const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Product = require('./models/productModel');

console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Check if products exist
    const productCount = await Product.countDocuments();
    console.log(`Current product count: ${productCount}`);
    
    if (productCount === 0) {
      console.log('No products found, creating test product...');
      
      // Create a test product
      const testProduct = new Product({
        id: 1,
        name: 'Test Wireless Earbuds',
        price: 99.99,
        description: 'Test wireless earbuds for cart testing',
        brand: 'TestBrand',
        category: 'Audio',
        inStock: true,
        countInStock: 10,
        rating: 4.5,
        numReviews: 5,
        images: ['https://via.placeholder.com/300x300?text=Test+Product'],
        features: ['Bluetooth', 'Wireless', 'Noise Cancellation'],
        specifications: new Map([
          ['Battery Life', '6 hours'],
          ['Connectivity', 'Bluetooth 5.0']
        ]),
        tags: ['wireless', 'earbuds', 'test'],
        weight: '50g',
        dimensions: '6x4x3 cm',
        warranty: '1 year'
      });
      
      await testProduct.save();
      console.log('Test product created successfully!');
    } else {
      console.log('Products already exist');
      const products = await Product.find().select('id name price inStock').limit(5);
      console.log('Sample products:', products);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
