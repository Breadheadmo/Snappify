// auditProducts.js
// Script to audit products for missing/invalid category, brand, or price

const mongoose = require('mongoose');
const Product = require('./models/productModel');
const db = require('./config/database');

async function auditProducts() {
  await db();
  const products = await Product.find({});
  let invalid = [];
  products.forEach(product => {
    if (!product.category || typeof product.category !== 'string' || !product.category.trim()) {
      invalid.push({ _id: product._id, field: 'category', value: product.category });
    }
    if (!product.brand || typeof product.brand !== 'string' || !product.brand.trim()) {
      invalid.push({ _id: product._id, field: 'brand', value: product.brand });
    }
    if (product.price === undefined || product.price === null || isNaN(product.price) || product.price < 0) {
      invalid.push({ _id: product._id, field: 'price', value: product.price });
    }
  });
  if (invalid.length === 0) {
    console.log('All products have valid category, brand, and price fields.');
  } else {
    console.log('Invalid products found:');
    console.table(invalid);
  }
  mongoose.connection.close();
}

auditProducts();
