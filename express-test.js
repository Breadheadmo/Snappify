const express = require('express');

// Create a simple Express app
const app = express();
const PORT = 4000;

// Simple health endpoint
app.get('/health', (req, res) => {
  console.log('Health endpoint accessed');
  res.json({ status: 'OK', message: 'Express test server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.json({ message: 'Welcome to Express test server' });
});

// Start server on 127.0.0.1
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Express test server running on http://127.0.0.1:${PORT}`);
});
