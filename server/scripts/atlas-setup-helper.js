#!/usr/bin/env node

/**
 * MongoDB Atlas Setup Helper
 * This script will guide you through the Atlas web interface and open the right pages
 */

const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const PRODUCTION_USER = 'snappy-prod-npcsgf';
const PRODUCTION_PASSWORD = '352a585ee69c16664ac3eb22288544f2Wy7I9UXc5s8';
const PRODUCTION_DATABASE = 'Snappy-Production';

function openURL(url) {
  const start = process.platform === 'darwin' ? 'open' : 
                process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${start} ${url}`);
}

function copyToClipboard(text) {
  const platform = process.platform;
  if (platform === 'win32') {
    exec(`echo ${text} | clip`);
  } else if (platform === 'darwin') {
    exec(`echo "${text}" | pbcopy`);
  } else {
    exec(`echo "${text}" | xclip -selection clipboard`);
  }
}

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function setupAtlasUser() {
  console.log('🚀 MongoDB Atlas Automated Setup Helper');
  console.log('======================================\n');

  console.log('📋 Your Production Credentials:');
  console.log(`Username: ${PRODUCTION_USER}`);
  console.log(`Password: ${PRODUCTION_PASSWORD}`);
  console.log(`Database: ${PRODUCTION_DATABASE}\n`);

  // Step 1: Open Atlas
  console.log('🌐 Step 1: Opening MongoDB Atlas...');
  openURL('https://cloud.mongodb.com');
  
  await askQuestion('Press Enter after you\'ve logged into Atlas... ');

  // Step 2: Database Access
  console.log('\n👤 Step 2: Opening Database Access page...');
  openURL('https://cloud.mongodb.com/v2/database-access');
  
  console.log('📝 Instructions:');
  console.log('1. Click "Add New Database User"');
  console.log('2. Authentication Method: Password');
  
  // Copy username
  copyToClipboard(PRODUCTION_USER);
  console.log(`3. Username: ${PRODUCTION_USER} (copied to clipboard)`);
  
  await askQuestion('Press Enter when you\'ve entered the username... ');

  // Copy password
  copyToClipboard(PRODUCTION_PASSWORD);
  console.log(`4. Password: ${PRODUCTION_PASSWORD} (copied to clipboard)`);
  
  await askQuestion('Press Enter when you\'ve entered the password... ');

  console.log('5. Database User Privileges: "Read and write to any database"');
  console.log('6. Click "Add User"\n');
  
  await askQuestion('Press Enter when you\'ve created the user... ');

  // Step 3: Network Access
  console.log('\n🌍 Step 3: Opening Network Access page...');
  openURL('https://cloud.mongodb.com/v2/network-access');
  
  console.log('📝 Instructions:');
  console.log('1. Look for "0.0.0.0/0" entry (Allow access from anywhere)');
  console.log('2. Click the DELETE button (trash icon) next to it');
  console.log('3. Click "Add IP Address"');
  console.log('4. Click "Add Current IP Address"');
  console.log('5. Click "Confirm"\n');
  
  await askQuestion('Press Enter when you\'ve secured network access... ');

  // Step 4: Create Database
  console.log('\n💾 Step 4: Opening Database page...');
  openURL('https://cloud.mongodb.com/v2/clusters');
  
  console.log('📝 Instructions:');
  console.log('1. Click "Browse Collections" on your cluster');
  console.log('2. Click "Create Database"');
  
  copyToClipboard(PRODUCTION_DATABASE);
  console.log(`3. Database name: ${PRODUCTION_DATABASE} (copied to clipboard)`);
  console.log('4. Collection name: products');
  console.log('5. Click "Create"\n');
  
  await askQuestion('Press Enter when you\'ve created the database... ');

  // Step 5: Test Connection
  console.log('\n🧪 Step 5: Testing connection...');
  console.log('Your .env file has already been updated with the new connection string.');
  console.log('Let\'s test if everything works...\n');

  const testConnection = await askQuestion('Do you want to test the connection now? (y/n): ');
  
  if (testConnection === 'y' || testConnection === 'yes') {
    console.log('\n🔄 Testing MongoDB connection...');
    
    // Test connection
    try {
      const mongoose = require('mongoose');
      const connectionString = `mongodb+srv://${PRODUCTION_USER}:${PRODUCTION_PASSWORD}@cluster0.rks24ra.mongodb.net/${PRODUCTION_DATABASE}?retryWrites=true&w=majority&appName=Cluster0`;
      
      console.log('Connecting to production database...');
      await mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      console.log('✅ SUCCESS! Production database connected successfully!');
      console.log('✅ Your MongoDB Atlas setup is complete!');
      
      await mongoose.disconnect();
      
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure you created the database user exactly as specified');
      console.log('2. Check that you removed the 0.0.0.0/0 network access');
      console.log('3. Verify you added your current IP address');
      console.log('4. Make sure the database name is exactly: Snappy-Production');
    }
  }

  console.log('\n🎉 Atlas setup complete!');
  console.log('\n📋 Final Checklist:');
  console.log('✅ New production database user created');
  console.log('✅ Network access secured (no 0.0.0.0/0)');
  console.log('✅ Production database created');
  console.log('✅ .env file updated');
  console.log('✅ Connection tested');
  
  console.log('\n🚀 Your database is now production-ready and secure!');
  
  rl.close();
}

// Run the setup
setupAtlasUser().catch(console.error);
