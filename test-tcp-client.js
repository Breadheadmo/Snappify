const net = require('net');

console.log('Attempting to connect to TCP server at 127.0.0.1:3001...');

const client = new net.Socket();

client.connect(3001, '127.0.0.1', () => {
  console.log('Connected to server');
  client.write('Hello from TCP client!');
});

client.on('data', (data) => {
  console.log(`Received data: ${data.toString()}`);
  client.end(); // Close the connection after receiving data
});

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', (err) => {
  console.log('Connection error:', err.message);
});
