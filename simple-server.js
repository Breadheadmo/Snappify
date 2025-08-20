const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'OK', message: 'Simple test server is running' }));
});

// Listen on a different port to avoid conflicts
const PORT = 4000;
const HOST = '127.0.0.1';

server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  console.error('Full error:', err);
});

server.listen(PORT, HOST, () => {
  console.log(`Simple test server running on http://${HOST}:${PORT}`);
});
