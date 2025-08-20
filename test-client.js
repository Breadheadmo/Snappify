const http = require('http');

console.log('Attempting to connect to 127.0.0.1:3001...');

const req = http.request({
  hostname: '127.0.0.1', // Using explicit IP instead of hostname
  port: 3001,
  path: '/',
  method: 'GET',
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`RESPONSE BODY: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`PROBLEM: ${e.message}`);
  console.error(e);
});

// End the request
req.end();
