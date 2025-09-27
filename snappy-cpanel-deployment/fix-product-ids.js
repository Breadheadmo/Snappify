const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/productModel');

dotenv.config();

console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Check products and add numeric IDs if missing
    const products = await Product.find();
    console.log(`Found ${products.length} products`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product.id) {
        product.id = i + 1; // Assign a numeric ID starting from 1
        await product.save();
        console.log(`Assigned ID ${product.id} to product: ${product.name}`);
      } else {
        console.log(`Product ${product.name} already has ID: ${product.id}`);
      }
    }
    
    // Display all products with their IDs
    const updatedProducts = await Product.find().select('_id id name price');
    console.log('All products:');
    updatedProducts.forEach(p => {
      console.log(`- ${p.name}: MongoDB ID = ${p._id}, Numeric ID = ${p.id}, Price = ${p.price}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
