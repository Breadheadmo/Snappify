const fetch = require('node-fetch');

async function testLoginAPI() {
  try {
    console.log('Testing login API...');
    
    // Test if the server is responding
    const healthResponse = await fetch('http://localhost:5001/api/users/profile');
    console.log('Health check status:', healthResponse.status);
    
    // Test login endpoint
    const loginResponse = await fetch('http://localhost:5001/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('Login successful!');
      console.log('User:', data.user?.username);
      console.log('Token exists:', !!data.token);
    } else {
      const errorText = await loginResponse.text();
      console.log('Login error:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testLoginAPI();
