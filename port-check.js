const net = require('net');

const testPort = (port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    
    socket.setTimeout(1000);
    socket.once('error', onError);
    socket.once('timeout', onError);
    
    socket.connect(port, '127.0.0.1', () => {
      socket.end();
      resolve(true);
    });
  });
};

const checkPorts = async () => {
  console.log('Checking port availability...');
  
  // Check both ports 3000 and 5000
  const port3000Available = await testPort(3000);
  const port5000Available = await testPort(5000);
  
  console.log(`Port 3000: ${port3000Available ? 'In use' : 'Available'}`);
  console.log(`Port 5000: ${port5000Available ? 'In use' : 'Available'}`);
};

checkPorts();
