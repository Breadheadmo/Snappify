const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function addTrackingNumbers() {
  try {
    console.log('🔄 Starting to add tracking numbers to orders...');
    
    // First, let's see what orders exist
    const existingOrders = await Order.find({}).populate('user', 'name email');
    console.log(`📦 Found ${existingOrders.length} existing orders`);
    
    if (existingOrders.length > 0) {
      console.log('📋 Existing orders:');
      existingOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. Order ID: ${order._id}, User: ${order.user?.email || 'Unknown'}, Status: ${order.status}, Tracking: ${order.trackingNumber || 'None'}`);
      });
      
      // Add tracking numbers to existing orders that don't have them
      for (let i = 0; i < existingOrders.length; i++) {
        const order = existingOrders[i];
        if (!order.trackingNumber) {
          const trackingNumber = `TRACK${Date.now()}${i}`;
          await Order.findByIdAndUpdate(order._id, {
            trackingNumber: trackingNumber,
            status: 'shipped', // Update status to shipped
            trackingStages: [
              {
                stage: 'Order Confirmed',
                status: 'completed',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                location: 'Warehouse'
              },
              {
                stage: 'Processing',
                status: 'completed',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                location: 'Fulfillment Center'
              },
              {
                stage: 'Shipped',
                status: 'completed',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                location: 'Distribution Center'
              },
              {
                stage: 'In Transit',
                status: 'current',
                timestamp: new Date(),
                location: 'En route to destination'
              }
            ]
          });
          console.log(`✅ Added tracking number ${trackingNumber} to order ${order._id}`);
        }
      }
    }
    
    // Create some additional test orders with tracking numbers if we have users and products
    const users = await User.find({});
    const products = await Product.find({}).limit(3);
    
    if (users.length > 0 && products.length > 0) {
      console.log('🆕 Creating additional test orders with tracking numbers...');
      
      const testOrders = [
        {
          user: users[0]._id,
          orderItems: [
            {
              product: products[0]._id,
              name: products[0].name,
              qty: 2,
              price: products[0].price,
              image: products[0].image
            }
          ],
          shippingAddress: {
            address: '123 Test Street',
            city: 'Cape Town',
            postalCode: '8001',
            country: 'South Africa'
          },
          paymentMethod: 'Paystack',
          paymentResult: {
            id: 'test_payment_1',
            status: 'COMPLETED'
          },
          totalPrice: products[0].price * 2,
          isPaid: true,
          paidAt: new Date(),
          status: 'shipped',
          trackingNumber: 'BULK123456',
          trackingStages: [
            {
              stage: 'Order Confirmed',
              status: 'completed',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              location: 'Warehouse Cape Town'
            },
            {
              stage: 'Processing',
              status: 'completed',
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
              location: 'Fulfillment Center'
            },
            {
              stage: 'Packed',
              status: 'completed',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              location: 'Packaging Department'
            },
            {
              stage: 'Shipped',
              status: 'completed',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              location: 'Distribution Center'
            },
            {
              stage: 'In Transit',
              status: 'current',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              location: 'En route to destination'
            }
          ]
        },
        {
          user: users[0]._id,
          orderItems: [
            {
              product: products[1]._id,
              name: products[1].name,
              qty: 1,
              price: products[1].price,
              image: products[1].image
            }
          ],
          shippingAddress: {
            address: '456 Demo Avenue',
            city: 'Johannesburg',
            postalCode: '2000',
            country: 'South Africa'
          },
          paymentMethod: 'Paystack',
          paymentResult: {
            id: 'test_payment_2',
            status: 'COMPLETED'
          },
          totalPrice: products[1].price,
          isPaid: true,
          paidAt: new Date(),
          status: 'delivered',
          trackingNumber: 'TRACK789XYZ',
          trackingStages: [
            {
              stage: 'Order Confirmed',
              status: 'completed',
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              location: 'Warehouse Johannesburg'
            },
            {
              stage: 'Processing',
              status: 'completed',
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
              location: 'Fulfillment Center'
            },
            {
              stage: 'Packed',
              status: 'completed',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              location: 'Packaging Department'
            },
            {
              stage: 'Shipped',
              status: 'completed',
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
              location: 'Distribution Center'
            },
            {
              stage: 'In Transit',
              status: 'completed',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              location: 'Local Delivery Hub'
            },
            {
              stage: 'Out for Delivery',
              status: 'completed',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              location: 'Local Courier'
            },
            {
              stage: 'Delivered',
              status: 'completed',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              location: 'Customer Address'
            }
          ]
        }
      ];
      
      for (const orderData of testOrders) {
        const existingOrder = await Order.findOne({ trackingNumber: orderData.trackingNumber });
        if (!existingOrder) {
          const order = new Order(orderData);
          await order.save();
          console.log(`✅ Created test order with tracking number: ${orderData.trackingNumber}`);
        } else {
          console.log(`⚠️ Order with tracking number ${orderData.trackingNumber} already exists`);
        }
      }
    }
    
    // Show final results
    const finalOrders = await Order.find({}).populate('user', 'name email');
    console.log(`\n🎉 Final result: ${finalOrders.length} orders total`);
    console.log('📋 Orders with tracking numbers:');
    finalOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. Order ID: ${order._id}`);
      console.log(`     User: ${order.user?.email || 'Unknown'}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Tracking: ${order.trackingNumber || 'None'}`);
      console.log(`     Total: R${order.totalPrice || 0}`);
      console.log('');
    });
    
    console.log('✅ Tracking numbers added successfully!');
    console.log('\n🧪 Test these tracking numbers:');
    finalOrders.forEach(order => {
      if (order.trackingNumber) {
        console.log(`   - ${order.trackingNumber}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

// Run the script
addTrackingNumbers();
