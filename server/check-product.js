const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkProduct() {
  try {
    await mongoose.connect('mongodb://localhost:27017/snappystore');
    console.log('Connected to MongoDB');
    
    const product = await Product.findOne({});
    if (product) {
      console.log('Product structure:');
      console.log('- _id:', product._id);
      console.log('- id:', product.id);
      console.log('- name:', product.name);
      console.log('- inStock:', product.inStock);
      console.log('- countInStock:', product.countInStock);
    } else {
      console.log('No products found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProduct();
