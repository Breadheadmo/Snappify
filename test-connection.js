const http = require('http');

console.log('🔍 Testing connection to backend server...');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/users/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:3000'
  }
};

const testData = JSON.stringify({
  email: 'test@example.com',
  password: 'password123'
});

const req = http.request(options, (res) => {
  console.log(`✅ Server responded with status: ${res.statusCode}`);
  console.log('📋 Response headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📦 Response body:', data);
  });
});

req.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  console.error('🔧 Possible issues:');
  console.error('  - Backend server not running on port 5001');
  console.error('  - Port blocked by firewall');
  console.error('  - CORS or network configuration issue');
});

req.write(testData);
req.end();
