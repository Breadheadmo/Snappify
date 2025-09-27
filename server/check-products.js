const mongoose = require('mongoose');
const Product = require('./models/productModel');
require('dotenv').config();

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find({});
    
    console.log('Current Products:');
    products.forEach(product => {
      console.log(`- ${product.name} -> Category: "${product.category}"`);
    });
    
    console.log('\nCategory distribution:');
    const categories = {};
    products.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`${category}: ${count} products`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts();
