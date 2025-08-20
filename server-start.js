/**
 * Enhanced server startup script for Snappy application
 * This script tries different server configurations to find one that works
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration options to try
const configs = [
  {
    port: 8080,
    host: '127.0.0.1',
    description: 'IPv4 localhost on port 8080'
  },
  {
    port: 3000,
    host: '127.0.0.1',
    description: 'IPv4 localhost on port 3000'
  },
  {
    port: 5000,
    host: '127.0.0.1',
    description: 'IPv4 localhost on port 5000'
  },
  {
    port: 8080,
    host: '0.0.0.0',
    description: 'All interfaces on port 8080'
  }
];

// Make sure server/index.js exists
const serverPath = path.join(__dirname, 'server', 'index.js');
if (!fs.existsSync(serverPath)) {
  console.error(`❌ Server file not found at ${serverPath}`);
  process.exit(1);
}

// Update .env file with configuration
const updateEnvFile = (config) => {
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    // Read existing .env file or create new one
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update PORT value
    if (envContent.includes('PORT=')) {
      envContent = envContent.replace(/PORT=\d+/, `PORT=${config.port}`);
    } else {
      envContent += `\nPORT=${config.port}`;
    }
    
    // Ensure SQLite is enabled
    if (envContent.includes('DB_USE_SQLITE=')) {
      envContent = envContent.replace(/DB_USE_SQLITE=.*/, 'DB_USE_SQLITE=true');
    } else {
      envContent += '\nDB_USE_SQLITE=true';
    }
    
    // Disable database alterations
    if (envContent.includes('DISABLE_DB_ALTER=')) {
      envContent = envContent.replace(/DISABLE_DB_ALTER=.*/, 'DISABLE_DB_ALTER=true');
    } else {
      envContent += '\nDISABLE_DB_ALTER=true';
    }
    
    // Add SERVER_HOST for binding
    if (envContent.includes('SERVER_HOST=')) {
      envContent = envContent.replace(/SERVER_HOST=.*/, `SERVER_HOST=${config.host}`);
    } else {
      envContent += `\nSERVER_HOST=${config.host}`;
    }
    
    // Write updated .env file
    fs.writeFileSync(envPath, envContent.trim());
    console.log(`✅ Updated .env with: PORT=${config.port}, SERVER_HOST=${config.host}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    return false;
  }
};

// Patch server code to use SERVER_HOST from env
const patchServerCode = () => {
  try {
    const serverCode = fs.readFileSync(serverPath, 'utf8');
    
    // Check if we need to patch the code
    if (!serverCode.includes('process.env.SERVER_HOST') && serverCode.includes('app.listen(PORT')) {
      // Find the app.listen statement
      const listenRegex = /(app\.listen\(PORT,\s*)['"](.*?)['"](\s*,\s*\(\) =>)/;
      if (listenRegex.test(serverCode)) {
        // Replace the hard-coded host with environment variable
        const newCode = serverCode.replace(
          listenRegex,
          '$1process.env.SERVER_HOST || $2$3'
        );
        
        // Backup original file
        const backupPath = `${serverPath}.backup`;
        if (!fs.existsSync(backupPath)) {
          fs.writeFileSync(backupPath, serverCode);
          console.log(`✅ Original server code backed up to ${backupPath}`);
        }
        
        // Write patched code
        fs.writeFileSync(serverPath, newCode);
        console.log('✅ Server code patched to use SERVER_HOST environment variable');
        return true;
      } else {
        console.log('⚠️ Could not find app.listen pattern to patch');
        return false;
      }
    } else {
      console.log('✅ Server code already uses environment variable for host');
      return true;
    }
  } catch (error) {
    console.error('❌ Error patching server code:', error.message);
    return false;
  }
};

// Start server with given configuration
const startServer = (config) => {
  console.log(`\n🚀 Starting server with ${config.description}...`);
  
  // Update environment for child process
  const env = {
    ...process.env,
    PORT: config.port.toString(),
    SERVER_HOST: config.host,
    DB_USE_SQLITE: 'true',
    DISABLE_DB_ALTER: 'true',
    NODE_ENV: 'development'
  };
  
  // Spawn server process
  const serverProcess = spawn('node', [serverPath], {
    env,
    stdio: 'inherit'
  });
  
  // Handle process events
  serverProcess.on('error', (error) => {
    console.error(`❌ Failed to start server: ${error.message}`);
  });
  
  serverProcess.on('exit', (code, signal) => {
    if (code !== null) {
      console.log(`⚠️ Server process exited with code ${code}`);
    } else if (signal !== null) {
      console.log(`⚠️ Server process killed with signal ${signal}`);
    }
  });
  
  // Return the process for later use
  return serverProcess;
};

// Main function
const main = async () => {
  console.log('=== SNAPPY SERVER STARTUP SCRIPT ===');
  console.log('This script will try different server configurations to find one that works');
  
  // Patch server code to use environment variable for host
  patchServerCode();
  
  // Get first configuration
  const config = configs[0];
  
  // Update .env file
  updateEnvFile(config);
  
  // Start server with this configuration
  const serverProcess = startServer(config);
  
  console.log('\n✅ Server startup initiated');
  console.log('📋 After server starts, run "node health-check.js" to verify it\'s working');
  console.log('📋 If the server fails to respond, stop it and try a different configuration');
  console.log(`📋 Next configuration to try: ${configs[1].description}`);
};

// Run the main function
main();
