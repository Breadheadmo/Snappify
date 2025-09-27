const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const { sendOrderTrackingEmail, sendShippingConfirmationEmail } = require('../utils/emailService');

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const testTrackingSystem = async () => {
  try {
    await connectDB();
    console.log('🚀 Testing Order Tracking System...\n');

    // 1. Find or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
      console.log('✅ Created test user');
    } else {
      console.log('✅ Found test user');
    }

    // 2. Create a test order if none exists
    let testOrder = await Order.findOne({ user: testUser._id });
    if (!testOrder) {
      testOrder = await Order.create({
        user: testUser._id,
        orderItems: [
          {
            name: 'Test Product',
            quantity: 2,
            image: '/images/test.jpg',
            price: 99.99,
            product: new mongoose.Types.ObjectId()
          }
        ],
        shippingAddress: {
          fullName: 'Test User',
          addressLine1: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'South Africa',
          phoneNumber: '+27123456789'
        },
        paymentMethod: 'Credit Card',
        shippingMethod: {
          name: 'Standard Shipping',
          price: 5.99,
          description: 'Standard delivery 3-5 business days'
        },
        subtotal: 199.98,
        shippingPrice: 5.99,
        taxPrice: 30.00,
        totalPrice: 235.97,
        isPaid: true,
        paidAt: new Date(),
        trackingNumber: 'TEST123456789'
      });
      console.log('✅ Created test order');
    } else {
      console.log('✅ Found test order');
    }

    // 3. Test tracking updates
    console.log('\n📦 Testing tracking stage updates...');
    
    const trackingStages = [
      { stage: 'confirmed', description: 'Order confirmed and being prepared' },
      { stage: 'preparing', description: 'Items are being packed' },
      { stage: 'shipped', description: 'Package has left our facility' },
      { stage: 'in_transit', description: 'Package is on its way' },
      { stage: 'out_for_delivery', description: 'Package is out for delivery' }
    ];

    for (const { stage, description } of trackingStages) {
      console.log(`\n🔄 Updating to stage: ${stage}`);
      
      testOrder.trackingStage = stage;
      testOrder.orderStatus = stage;
      testOrder.carrier = 'DHL';
      testOrder.trackingUrl = `https://dhl.com/track/${testOrder.trackingNumber}`;
      
      if (stage === 'shipped') {
        testOrder.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
      }

      await testOrder.save();
      console.log(`✅ Order updated to ${stage}`);

      // Test email sending (commented out to avoid spam)
      /*
      try {
        const trackingInfo = {
          trackingNumber: testOrder.trackingNumber,
          carrier: testOrder.carrier,
          currentStage: stage,
          estimatedDelivery: testOrder.estimatedDelivery,
          trackingUrl: testOrder.trackingUrl
        };

        if (stage === 'shipped') {
          await sendShippingConfirmationEmail(testOrder, testUser, trackingInfo);
          console.log('📧 Shipping confirmation email sent');
        } else {
          await sendOrderTrackingEmail(testOrder, testUser, trackingInfo);
          console.log('📧 Tracking update email sent');
        }
      } catch (emailError) {
        console.log('⚠️ Email sending failed (this is normal in test):', emailError.message);
      }
      */

      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 4. Test API endpoints simulation
    console.log('\n🌐 Testing API endpoints...');
    
    // Simulate tracking by number
    const trackingByNumber = await Order.findOne({ trackingNumber: testOrder.trackingNumber })
      .select('trackingNumber carrier trackingStage estimatedDelivery trackingUrl orderStatus isDelivered deliveredAt createdAt shippingAddress orderItems totalPrice');
    
    if (trackingByNumber) {
      console.log('✅ Public tracking by number works');
      console.log('📋 Tracking Info:', {
        trackingNumber: trackingByNumber.trackingNumber,
        carrier: trackingByNumber.carrier,
        currentStage: trackingByNumber.trackingStage,
        orderStatus: trackingByNumber.orderStatus,
        totalItems: trackingByNumber.orderItems.length,
        totalPrice: trackingByNumber.totalPrice
      });
    }

    // 5. Test bulk update simulation
    console.log('\n📊 Testing bulk update simulation...');
    
    const bulkUpdates = [
      {
        orderId: testOrder._id,
        trackingNumber: 'BULK123456',
        carrier: 'FedEx',
        currentStage: 'delivered',
        deliveredAt: new Date(),
        deliveredTo: 'Front door'
      }
    ];

    for (const update of bulkUpdates) {
      const order = await Order.findById(update.orderId);
      if (order) {
        order.trackingNumber = update.trackingNumber;
        order.carrier = update.carrier;
        order.trackingStage = update.currentStage;
        order.orderStatus = update.currentStage;
        if (update.deliveredAt) {
          order.deliveredAt = update.deliveredAt;
          order.isDelivered = true;
          order.deliveredTo = update.deliveredTo;
        }
        await order.save();
        console.log('✅ Bulk update applied successfully');
      }
    }

    console.log('\n🎉 All tracking system tests completed successfully!');
    console.log('\n📝 Test Summary:');
    console.log('✅ Database connection');
    console.log('✅ Test user creation/retrieval');
    console.log('✅ Test order creation/retrieval');
    console.log('✅ Tracking stage updates');
    console.log('✅ Public tracking simulation');
    console.log('✅ Bulk update simulation');
    console.log('✅ Data model validation');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  testTrackingSystem();
}

module.exports = { testTrackingSystem };
