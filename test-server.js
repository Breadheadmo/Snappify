const http = require('http');
const os = require('os');

// Get all network interfaces
const networkInterfaces = os.networkInterfaces();
console.log('Available network interfaces:');
console.log(JSON.stringify(networkInterfaces, null, 2));

const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'OK', 
    message: 'Test server is running',
    requestInfo: {
      method: req.method,
      url: req.url,
      headers: req.headers
    }
  }));
});

const HOST = '127.0.0.1'; // Changed to explicit IP
const PORT = 3001;

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(PORT, HOST, () => {
  console.log(`Test server running on http://${HOST}:${PORT}`);
});
