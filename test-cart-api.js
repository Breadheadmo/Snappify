// Using global fetch instead of node-fetch for simplicity
const fetch = global.fetch || require('node-fetch');

async function testCartAPI() {
  try {
    console.log('Testing cart API endpoint...');
    
    // First, let's login to get a token
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    
    const token = loginData.token;
    console.log('Got token:', token ? 'YES' : 'NO');
    
    // Now test adding to cart
    console.log('\n2. Testing add to cart...');
    const productId = '67668bff903d7e74fc392aaa202'; // Samsung Galaxy S24 Ultra ID from earlier
    
    const cartResponse = await fetch('http://localhost:5001/api/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: productId,
        quantity: 1
      })
    });
    
    console.log('Cart response status:', cartResponse.status);
    const cartData = await cartResponse.json();
    console.log('Cart response data:', cartData);
    
    if (!cartResponse.ok) {
      throw new Error(`Cart add failed: ${cartData.message}`);
    }
    
    console.log('\n✅ Cart API test successful!');
    
  } catch (error) {
    console.error('❌ Cart API test failed:', error.message);
  }
}

testCartAPI();
