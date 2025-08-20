// MongoDB specific test
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing MongoDB connection...');
console.log(`MONGO_URI: ${process.env.MONGO_URI ? 'Found in environment' : 'NOT FOUND in environment'}`);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('\n✅ MongoDB connection SUCCESSFUL');
    console.log(`MongoDB connected to: ${process.env.MONGO_URI.split('@')[1].split('/')[0]}`);
    console.log(`Database name: ${process.env.MONGO_URI.split('/').pop().split('?')[0]}`);
    
    // Check collections
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Load models
    console.log('\nLoading models...');
    const User = require('./server/models/userModel');
    const Product = require('./server/models/productModel');
    
    // Count users
    console.log('\nCounting users...');
    return User.countDocuments()
      .then(count => {
        console.log(`Found ${count} users in database`);
        if (count > 0) {
          return User.findOne();
        }
        return null;
      })
      .then(user => {
        if (user) {
          console.log('Sample user:');
          console.log(`- Username: ${user.username}`);
          console.log(`- Email: ${user.email}`);
          console.log(`- Admin: ${user.isAdmin}`);
          console.log(`- Created: ${user.createdAt}`);
        }
        
        // Count products
        console.log('\nCounting products...');
        return Product.countDocuments();
      })
      .then(count => {
        console.log(`Found ${count} products in database`);
        if (count > 0) {
          return Product.findOne();
        }
        return null;
      })
      .then(product => {
        if (product) {
          console.log('Sample product:');
          console.log(`- Name: ${product.name}`);
          console.log(`- Price: $${(product.price / 100).toFixed(2)}`);
          console.log(`- Brand: ${product.brand}`);
          console.log(`- Category: ${product.category}`);
          console.log(`- Stock: ${product.countInStock}`);
        }
        
        // Close connection and exit
        mongoose.connection.close();
        console.log('\nMongoDB test complete!');
      });
  })
  .catch(err => {
    console.error('\n❌ MongoDB connection FAILED');
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });
