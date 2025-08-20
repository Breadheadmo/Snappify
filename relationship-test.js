/**
 * Database relationship test script
 * Tests relationships between models
 */
const { sequelize } = require('./server/config/database');
const db = require('./server/models');

async function testRelationships() {
  try {
    console.log('=== DATABASE RELATIONSHIP TEST ===');
    
    // Test User-Product relationship (Wishlist)
    console.log('\n1. Testing User-Product (Wishlist) relationship:');
    // Create test user if not exists
    let testUser = await db.User.findOne({ where: { username: 'testuser' } });
    if (!testUser) {
      testUser = await db.User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
      console.log('  Created test user');
    }
    
    // Get a product
    const product = await db.Product.findOne();
    if (!product) {
      console.log('  ❌ No products found to test with');
      return;
    }
    
    // Add product to wishlist
    await testUser.addWishlistItem(product);
    console.log('  Added product to wishlist');
    
    // Verify wishlist
    const wishlist = await testUser.getWishlistItems();
    console.log(`  ✅ User wishlist contains ${wishlist.length} products`);
    
    // Test User-Order relationship
    console.log('\n2. Testing User-Order relationship:');
    const testOrder = await db.Order.create({
      userId: testUser.id,
      total: 49.99,
      status: 'pending',
      paymentMethod: 'credit_card',
      paymentStatus: 'pending'
    });
    console.log('  Created test order');
    
    // Verify user orders
    const userOrders = await testUser.getOrders();
    console.log(`  ✅ User has ${userOrders.length} orders`);
    
    // Test Order-OrderItem relationship
    console.log('\n3. Testing Order-OrderItem relationship:');
    const orderItem = await db.OrderItem.create({
      orderId: testOrder.id,
      productId: product.id,
      quantity: 1,
      price: product.price
    });
    console.log('  Created order item');
    
    // Verify order items
    const orderItems = await testOrder.getOrderItems();
    console.log(`  ✅ Order has ${orderItems.length} items`);
    
    // Test Product-Review relationship
    console.log('\n4. Testing Product-Review relationship:');
    const review = await db.Review.create({
      userId: testUser.id,
      productId: product.id,
      rating: 5,
      title: 'Great product',
      comment: 'This is a test review',
      verified: true
    });
    console.log('  Created review');
    
    // Verify product reviews
    const productReviews = await product.getReviews();
    console.log(`  ✅ Product has ${productReviews.length} reviews`);
    
    // Clean up test data (optional)
    console.log('\nCleaning up test data...');
    await review.destroy();
    await orderItem.destroy();
    await testOrder.destroy();
    await testUser.removeWishlistItem(product);
    console.log('✅ Test data cleaned up');
    
    console.log('\n=== RELATIONSHIP TEST RESULTS ===');
    console.log('✅ All database relationships are working correctly');
    
  } catch (error) {
    console.error('❌ Relationship test failed:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the test
testRelationships();
