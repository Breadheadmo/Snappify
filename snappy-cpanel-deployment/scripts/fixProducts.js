// fixProducts.js
// Script to update missing/invalid category, brand, or price fields in products

const mongoose = require('mongoose');
const Product = require('./models/productModel');
const db = require('./config/database');

const DEFAULT_CATEGORY = 'Misc';
const DEFAULT_BRAND = 'Generic';
const DEFAULT_PRICE = 1;

async function fixProducts() {
  await db();
  const products = await Product.find({});
  let fixed = 0;
  for (const product of products) {
    let needsUpdate = false;
    if (!product.category || typeof product.category !== 'string' || !product.category.trim()) {
      product.category = DEFAULT_CATEGORY;
      needsUpdate = true;
    }
    if (!product.brand || typeof product.brand !== 'string' || !product.brand.trim()) {
      product.brand = DEFAULT_BRAND;
      needsUpdate = true;
    }
    if (product.price === undefined || product.price === null || isNaN(product.price) || product.price < 0) {
      product.price = DEFAULT_PRICE;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await product.save();
      fixed++;
    }
  }
  console.log(`Fixed ${fixed} products.`);
  mongoose.connection.close();
}

fixProducts();
