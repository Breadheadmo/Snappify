const { sequelize, testConnection } = require('./server/config/database');
const db = require('./server/models');

// Function to test database functionality
const testDatabase = async () => {
  try {
    // Test connection
    console.log('Testing database connection...');
    await testConnection();
    
    // Check model definitions
    console.log('\nChecking model definitions...');
    console.log('Available models:', Object.keys(db));
    
    // Check if we can fetch products
    console.log('\nTesting product retrieval...');
    const products = await db.Product.findAll({ limit: 3 });
    console.log(`Found ${products.length} products`);
    console.log('Sample product data:', JSON.stringify(products[0], null, 2));
    
    // Check if we can fetch users
    console.log('\nTesting user retrieval...');
    const users = await db.User.findAll({ 
      attributes: ['id', 'username', 'email', 'role', 'createdAt'],
      limit: 3 
    });
    console.log(`Found ${users.length} users`);
    if (users.length > 0) {
      console.log('Sample user data:', JSON.stringify(users[0], null, 2));
    }
    
    // Check other tables
    console.log('\nTesting order retrieval...');
    const orders = await db.Order.findAll({ limit: 3 });
    console.log(`Found ${orders.length} orders`);
    
    console.log('\nTesting review retrieval...');
    const reviews = await db.Review.findAll({ limit: 3 });
    console.log(`Found ${reviews.length} reviews`);
    
    console.log('\nDatabase tests completed successfully');
  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed');
  }
};

// Run the tests
testDatabase();
