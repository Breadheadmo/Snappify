import React, { useEffect } from 'react';
import api from './services/api';

// Function to test the API services with mock data
const testMockAPI = async () => {
  try {
    // Test product API
    console.log('Testing product API...');
    const products = await api.products.getProducts();
    console.log('Products:', products);

    // Test auth API with mock login
    console.log('\nTesting auth API...');
    const loginResult = await api.auth.login('test@example.com', 'password123');
    console.log('Login result:', loginResult);

    // Test wishlist API
    console.log('\nTesting wishlist API...');
    const wishlist = await api.wishlist.getWishlist();
    console.log('Wishlist:', wishlist);

    // Test cart API
    console.log('\nTesting cart API...');
    const cart = await api.cart.getCart();
    console.log('Cart:', cart);

    console.log('\nAll API tests passed successfully with mock data!');
  } catch (error) {
    console.error('API test failed:', error);
  }
};

// API Test component
function ApiTest() {
  useEffect(() => {
    testMockAPI();
  }, []);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Snappy API Test</h1>
      <p>Please check the console for API test results.</p>
    </div>
  );
}

export default ApiTest;
