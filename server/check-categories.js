const mongoose = require('mongoose');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');

async function checkCategories() {
  try {
    await mongoose.connect('mongodb://localhost:27017/snappy');
    
    console.log('Checking categories collection...');
    const categories = await Category.find({});
    console.log('Categories in database:', categories.length);
    
    if (categories.length > 0) {
      categories.forEach(cat => {
        console.log(`- ${cat.name} (${cat.slug})`);
      });
    } else {
      console.log('No categories found in Category collection');
    }
    
    console.log('\nChecking product categories...');
    const productCategories = await Product.distinct('category');
    console.log('Product categories:', productCategories);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCategories();
