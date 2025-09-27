const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables  
dotenv.config();

// Import models
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

// Connect to MongoDB
const connectAndCreateOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if we have users and products
    const users = await User.find({});
    const products = await Product.find({});
    
    console.log(`📊 Found ${users.length} users and ${products.length} products`);

    if (users.length === 0) {
      console.log('❌ No users found. Creating a test user...');
      const testUser = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMye5IcxgwwdVQJnXCXVlr8KTb1lcNaJBu6', // password123
        isAdmin: false
      });
      await testUser.save();
      users.push(testUser);
      console.log('✅ Test user created');
    }

    if (products.length === 0) {
      console.log('❌ No products found. Creating test products...');
      const testProducts = [
        {
          name: 'Samsung Galaxy S24',
          image: '/images/phone.jpg',
          description: 'Latest smartphone with advanced features',
          brand: 'Samsung',
          category: 'Electronics',
          price: 15999,
          countInStock: 10,
          rating: 4.5,
          numReviews: 12,
          user: users[0]._id
        },
        {
          name: 'Apple MacBook Pro',
          image: '/images/laptop.jpg', 
          description: 'Professional laptop for creative work',
          brand: 'Apple',
          category: 'Electronics',
          price: 35999,
          countInStock: 5,
          rating: 4.8,
          numReviews: 8,
          user: users[0]._id
        }
      ];
      
      const createdProducts = await Product.insertMany(testProducts);
      products.push(...createdProducts);
      console.log('✅ Test products created');
    }

    // Now create orders with tracking numbers
    console.log('🚛 Creating orders with tracking numbers...');

    const ordersWithTracking = [
      {
        user: users[0]._id,
        orderItems: [
          {
            name: products[0].name,
            quantity: 1,
            image: products[0].image || '/images/products/placeholder.jpg',
            price: products[0].price,
            product: products[0]._id,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          addressLine1: '123 Main Street',
          addressLine2: 'Apartment 4B',
          city: 'Cape Town',
          postalCode: '8001',
          country: 'South Africa',
          phoneNumber: '+27-21-555-0123',
        },
        shippingMethod: {
          name: 'Standard Delivery',
          price: 99,
          description: '3-5 business days'
        },
        paymentMethod: 'Paystack',
        paymentResult: {
          id: 'test_payment_001',
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          email_address: users[0].email,
        },
        taxPrice: 0,
        shippingPrice: 99,
        subtotal: products[0].price,
        totalPrice: products[0].price + 99,
        isPaid: true,
        paidAt: new Date(),
        status: 'Shipped',
        orderStatus: 'shipped',
        trackingNumber: 'BULK123456',
        carrier: 'DHL',
        trackingStage: 'shipped',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        user: users[0]._id,
        orderItems: [
          {
            name: products[1]?.name || 'Test Product',
            quantity: 1,
            image: products[1]?.image || '/images/products/placeholder2.jpg',
            price: products[1]?.price || 999,
            product: products[1]?._id || products[0]._id,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          addressLine1: '456 Oak Avenue',
          city: 'Johannesburg', 
          postalCode: '2000',
          country: 'South Africa',
          phoneNumber: '+27-11-555-0456',
        },
        shippingMethod: {
          name: 'Express Delivery',
          price: 199,
          description: '1-2 business days'
        },
        paymentMethod: 'Paystack',
        paymentResult: {
          id: 'test_payment_002',
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          email_address: users[0].email,
        },
        taxPrice: 0,
        shippingPrice: 199,
        subtotal: products[1]?.price || 999,
        totalPrice: (products[1]?.price || 999) + 199,
        isPaid: true,
        paidAt: new Date(),
        isDelivered: true,
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'Delivered',
        orderStatus: 'delivered',
        trackingNumber: 'TRACK789XYZ',
        carrier: 'FedEx',
        trackingStage: 'delivered',
        deliveredTo: 'John Doe',
      }
    ];

    // Check if orders already exist
    for (const orderData of ordersWithTracking) {
      const existingOrder = await Order.findOne({ trackingNumber: orderData.trackingNumber });
      if (!existingOrder) {
        const order = new Order(orderData);
        await order.save();
        console.log(`✅ Created order with tracking number: ${orderData.trackingNumber}`);
      } else {
        console.log(`⚠️ Order with tracking ${orderData.trackingNumber} already exists`);
      }
    }

    // Show all orders
    const allOrders = await Order.find({}).populate('user', 'name email');
    console.log(`\n📦 Total orders in database: ${allOrders.length}`);
    
    console.log('\n📋 Orders with tracking numbers:');
    allOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order._id.toString().substring(0, 8)}...`);
      console.log(`   User: ${order.user?.email || 'Unknown'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Tracking: ${order.trackingNumber || 'None'}`);
      console.log(`   Total: R${order.totalPrice}`);
      console.log('');
    });

    console.log('🎉 Setup complete!');
    console.log('\n🧪 You can now test these tracking numbers:');
    allOrders.forEach(order => {
      if (order.trackingNumber) {
        console.log(`   ✓ ${order.trackingNumber}`);
      }
    });

    console.log('\n📝 To test:');
    console.log('1. Login with: john@example.com / password123');
    console.log('2. Go to Profile → Order History');
    console.log('3. You should see orders with tracking numbers!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

connectAndCreateOrders();
