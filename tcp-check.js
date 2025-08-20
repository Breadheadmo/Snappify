const net = require('net');

const PORT = 3000;
const HOST = '127.0.0.1';

// Create a simple TCP client
const client = new net.Socket();

console.log(`Attempting to connect to ${HOST}:${PORT}...`);

client.connect(PORT, HOST, () => {
  console.log('Connected!');
  client.write('Hello, server! Are you there?');
});

client.on('data', (data) => {
  console.log(`Received: ${data}`);
  client.destroy();
});

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', (err) => {
  console.error(`Connection error: ${err.message}`);
  console.error('Full error:', err);
});
