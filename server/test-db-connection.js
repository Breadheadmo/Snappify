require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB connection...');
console.log('📊 Database: Snappy Ecommerce');
console.log('👤 User: snappy-prod-npcsgf');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful to Snappy Ecommerce database!');
    console.log('🎉 Your production database is ready!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    console.error('💡 Make sure the MongoDB Atlas user has the correct permissions');
    process.exit(1);
  });
