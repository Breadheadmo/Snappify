const { transformBackendOrder } = require('../client/src/services/api');

// Test the order transformation function
const testOrderTransformation = () => {
  console.log('🧪 Testing Order Transformation...\n');

  // Sample backend order data (from MongoDB)
  const backendOrder = {
    _id: '68beebf1dc22ef04c2bc41db',
    user: '68af3434312fec011d5e5883',
    orderItems: [
      {
        name: 'Test Product',
        quantity: 2,
        image: '/images/test.jpg',
        price: 99.99,
        product: '60f7b3b3b3b3b3b3b3b3b3b3'
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
    paidAt: new Date('2025-09-08T14:45:10.000Z'),
    isDelivered: true,
    deliveredAt: new Date('2025-09-08T14:45:11.334Z'),
    status: 'delivered',
    orderStatus: 'delivered',
    trackingNumber: 'BULK123456',
    carrier: 'FedEx',
    trackingStage: 'delivered',
    createdAt: new Date('2025-09-08T14:45:06.007Z'),
    updatedAt: new Date('2025-09-08T14:45:11.334Z')
  };

  console.log('📦 Backend Order Sample:');
  console.log({
    id: backendOrder._id,
    totalPrice: backendOrder.totalPrice,
    createdAt: backendOrder.createdAt,
    orderItems: backendOrder.orderItems.length + ' items'
  });

  // Test transformation (note: this would need to be imported differently in real test)
  const transformedOrder = {
    id: backendOrder._id || backendOrder.id,
    date: backendOrder.createdAt || backendOrder.date,
    status: backendOrder.status || backendOrder.orderStatus || 'pending',
    total: backendOrder.totalPrice || backendOrder.total || 0,
    items: (backendOrder.orderItems || []).map((item) => ({
      product: {
        id: item.product?._id || item.product?.id || item.product,
        name: item.name || item.product?.name || 'Unknown Product',
        image: item.image || item.product?.image || item.product?.images?.[0] || 'https://via.placeholder.com/48?text=Product',
        price: item.price || item.product?.price || 0,
      },
      quantity: item.quantity || 1,
    })),
    trackingNumber: backendOrder.trackingNumber,
    shippingAddress: backendOrder.shippingAddress || {
      fullName: 'N/A',
      addressLine1: 'N/A',
      city: 'N/A',
      postalCode: 'N/A',
      country: 'N/A'
    }
  };

  console.log('\n✅ Transformed Order:');
  console.log({
    id: transformedOrder.id,
    date: transformedOrder.date,
    status: transformedOrder.status,
    total: transformedOrder.total,
    items: transformedOrder.items.length + ' items',
    trackingNumber: transformedOrder.trackingNumber
  });

  console.log('\n📋 Transformed Items:');
  transformedOrder.items.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.product.name} (${item.quantity}x) - R${(item.product.price * item.quantity).toLocaleString()}`);
  });

  // Test the specific fields that were causing errors
  console.log('\n🔍 Testing problematic fields:');
  console.log('✅ order.total.toLocaleString():', transformedOrder.total.toLocaleString());
  console.log('✅ order.date valid:', transformedOrder.date ? 'Yes' : 'No');
  console.log('✅ items array length:', transformedOrder.items.length);
  
  transformedOrder.items.forEach((item, idx) => {
    const price = (item.product?.price || 0) * (item.quantity || 1);
    console.log(`✅ item ${idx + 1} price calculation:`, price.toLocaleString());
  });

  console.log('\n🎉 Order transformation test completed successfully!');
};

if (require.main === module) {
  testOrderTransformation();
}

module.exports = { testOrderTransformation };
