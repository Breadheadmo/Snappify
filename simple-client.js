const http = require('http');

console.log('Attempting to connect to http://127.0.0.1:4000...');

const options = {
  hostname: '127.0.0.1',
  port: 4000,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
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
  console.error('Full error:', e);
});

req.end();
