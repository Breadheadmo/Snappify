const mongoose = require('mongoose');
const Product = require('./models/productModel');

async function clearProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/snappystore');
    console.log('✅ Connected to MongoDB');

    console.log('📊 Checking current products...');
    const count = await Product.countDocuments();
    console.log(`Current products in database: ${count}`);

    if (count > 0) {
      console.log('🗑️ Clearing all products...');
      const result = await Product.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} products`);
    } else {
      console.log('ℹ️ No products to delete');
    }

    console.log('🎉 Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

clearProducts();
