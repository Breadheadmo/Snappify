const net = require('net');

// Create a simple TCP server
const server = net.createServer((socket) => {
  console.log('Client connected');
  
  socket.on('data', (data) => {
    console.log(`Received data: ${data.toString()}`);
    socket.write('Hello from TCP server!');
  });
  
  socket.on('end', () => {
    console.log('Client disconnected');
  });
  
  socket.on('error', (err) => {
    console.log('Socket error:', err.message);
  });
});

// Handle server errors
server.on('error', (err) => {
  console.log('Server error:', err.message);
});

// Start listening
const HOST = '127.0.0.1';
const PORT = 3001;

server.listen(PORT, HOST, () => {
  console.log(`TCP server running on ${HOST}:${PORT}`);
});
