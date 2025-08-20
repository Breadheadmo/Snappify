const http = require('http');
const net = require('net');
const os = require('os');
const dns = require('dns');

// Configuration
const SERVER_PORTS = [3000, 5000, 8080]; // Try multiple common ports
const HOST = '127.0.0.1';
const API_PATH = '/api/health';

// Network information for diagnostics
console.log('=== NETWORK DIAGNOSTIC INFORMATION ===');
// Check network interfaces
console.log('\nNetwork Interfaces:');
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
    console.error('  Error resolving localhost:', err);
  } else {
    console.log(`  localhost resolves to: ${address} (IPv${family})`);
  }
});

// Function to check if a port is open
const checkPort = (port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;
    
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      status = true;
      socket.destroy();
    });
    
    socket.on('timeout', () => {
      socket.destroy();
    });
    
    socket.on('error', () => {
      socket.destroy();
    });
    
    socket.on('close', () => {
      resolve(status);
    });
    
    socket.connect(port, HOST);
  });
};

// Function to test the health endpoint
const checkHealthEndpoint = (port) => {
  return new Promise((resolve) => {
    console.log(`\nTesting health endpoint at http://${HOST}:${port}${API_PATH}`);
    
    const options = {
      hostname: HOST,
      port: port,
      path: API_PATH,
      method: 'GET',
      family: 4, // Force IPv4
      timeout: 3000 // 3 second timeout
    };
    
    const req = http.request(options, (res) => {
      console.log(`  STATUS: ${res.statusCode}`);
      console.log(`  HEADERS: ${JSON.stringify(res.headers)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          console.log(`  RESPONSE: ${JSON.stringify(parsedData)}`);
          resolve({ success: true, data: parsedData });
        } catch (e) {
          console.log(`  RAW RESPONSE: ${data}`);
          resolve({ success: true, data: data });
        }
      });
    });
    
    req.on('error', (e) => {
      console.error(`  ERROR: ${e.message}`);
      resolve({ success: false, error: e.message });
    });
    
    req.on('timeout', () => {
      console.error('  Request timed out');
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
    
    req.end();
  });
};

// Main function to run all checks
const runDiagnostics = async () => {
  console.log('\n=== PORT AVAILABILITY CHECK ===');
  
  // Check all ports
  for (const port of SERVER_PORTS) {
    const isOpen = await checkPort(port);
    console.log(`Port ${port}: ${isOpen ? 'OPEN (in use)' : 'CLOSED (available)'}`);
    
    // If port is open, check health endpoint
    if (isOpen) {
      await checkHealthEndpoint(port);
    }
  }
  
  console.log('\n=== RECOMMENDATIONS ===');
  console.log('1. If all ports show as CLOSED but the server should be running:');
  console.log('   - Check if server process is actually running (Get-Process node)');
  console.log('   - Check server logs for binding errors');
  console.log('   - Try running the server with explicit binding: node server/index.js');
  
  console.log('\n2. If ports show as OPEN but health check fails:');
  console.log('   - Check if another service is using the port');
  console.log('   - Verify server is correctly handling the health endpoint');
  console.log('   - Check for firewall or security software blocking connections');
  
  console.log('\n3. Specific PowerShell commands to try:');
  console.log('   - $env:PORT = "8080"; $env:DB_USE_SQLITE = "true"; $env:DISABLE_DB_ALTER = "true"; node server/index.js');
  console.log('   - powershell -Command "netstat -ano | findstr \':8080\'"');
};

// Run the diagnostics
runDiagnostics();
