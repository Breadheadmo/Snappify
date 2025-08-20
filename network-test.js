const os = require('os');
const dns = require('dns');

// Print network interfaces
console.log('Network Interfaces:');
const networkInterfaces = os.networkInterfaces();
Object.keys(networkInterfaces).forEach((interfaceName) => {
  console.log(`  ${interfaceName}:`);
  networkInterfaces[interfaceName].forEach((address) => {
    console.log(`    ${address.family}: ${address.address}`);
  });
});

// Check localhost resolution
console.log('\nChecking localhost resolution:');
dns.lookup('localhost', (err, address, family) => {
  if (err) {
    console.error('Error resolving localhost:', err);
  } else {
    console.log(`localhost resolves to: ${address} (IPv${family})`);
  }
  
  // Also check direct 127.0.0.1
  console.log('\nTrying direct ping of 127.0.0.1 via DNS:');
  dns.lookup('127.0.0.1', (err, address, family) => {
    if (err) {
      console.error('Error resolving 127.0.0.1:', err);
    } else {
      console.log(`127.0.0.1 resolves to: ${address} (IPv${family})`);
    }
  });
});
