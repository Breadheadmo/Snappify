#!/usr/bin/env node

/**
 * MongoDB Production Security Setup
 * This script guides you through securing your MongoDB Atlas database for production
 */

console.log('🔒 MongoDB Production Security Setup');
console.log('====================================\n');

// Generated secure credentials
const PRODUCTION_USER = 'snappy-prod-npcsgf';
const PRODUCTION_PASSWORD = '352a585ee69c16664ac3eb22288544f2Wy7I9UXc5s8';
const PRODUCTION_DATABASE = 'Snappy-Production';

console.log('🎯 Generated Production Credentials:');
console.log('===================================');
console.log(`Username: ${PRODUCTION_USER}`);
console.log(`Password: ${PRODUCTION_PASSWORD}`);
console.log(`Database: ${PRODUCTION_DATABASE}\n`);

console.log('⚠️  CRITICAL SECURITY STEPS:');
console.log('============================\n');

console.log('1. 🌐 Login to MongoDB Atlas (https://cloud.mongodb.com)');
console.log('   - Use your existing account (breadheadmo)\n');

console.log('2. 👤 Create New Database User:');
console.log('   - Go to "Database Access" in left sidebar');
console.log('   - Click "Add New Database User"');
console.log('   - Authentication Method: Password');
console.log(`   - Username: ${PRODUCTION_USER}`);
console.log(`   - Password: ${PRODUCTION_PASSWORD}`);
console.log('   - Database User Privileges: "Read and write to any database"');
console.log('   - Built-in Role: "readWrite@admin"');
console.log('   - Click "Add User"\n');

console.log('3. 🌍 Configure Network Access:');
console.log('   - Go to "Network Access" in left sidebar');
console.log('   - Current: "0.0.0.0/0" (Allow access from anywhere) - REMOVE THIS!');
console.log('   - Click "Add IP Address"');
console.log('   - Add your production server IPs when you have them');
console.log('   - For now, add your current IP for testing');
console.log('   - Click "Confirm"\n');

console.log('4. 💾 Create Production Database:');
console.log('   - Go to "Database" (Browse Collections)');
console.log('   - Click "Create Database"');
console.log(`   - Database name: ${PRODUCTION_DATABASE}`);
console.log('   - Collection name: products (just for creation)');
console.log('   - Click "Create"\n');

console.log('5. 🔧 Update Your Environment:');
console.log('   - Update your .env file with the new connection string:');

const newConnectionString = `mongodb+srv://${PRODUCTION_USER}:${PRODUCTION_PASSWORD}@cluster0.rks24ra.mongodb.net/${PRODUCTION_DATABASE}?retryWrites=true&w=majority&appName=Cluster0`;

console.log(`   MONGO_URI=${newConnectionString}\n`);

console.log('6. 🧪 Test Connection:');
console.log('   - Save the .env file');
console.log('   - Run: npm start');
console.log('   - Check if server connects successfully');
console.log('   - Test a simple API call\n');

console.log('7. 📊 Enable Monitoring (Recommended):');
console.log('   - Go to "Monitoring" tab');
console.log('   - Set up alerts for:');
console.log('     * High CPU usage (>80%)');
console.log('     * High memory usage (>80%)');
console.log('     * Connection spikes');
console.log('     * Failed authentication attempts\n');

console.log('8. 💾 Configure Backups:');
console.log('   - Go to "Backup" tab');
console.log('   - Enable "Continuous Cloud Backup"');
console.log('   - Set retention policy (recommended: 7 days)');
console.log('   - Schedule regular backup tests\n');

console.log('🚨 SECURITY REMINDERS:');
console.log('======================');
console.log('❌ NEVER use the old credentials (breadheadmo/Sabbathworld3500) for production');
console.log('❌ NEVER commit the new connection string to Git');
console.log('❌ NEVER share these credentials in chat/email');
console.log('✅ ALWAYS use separate credentials for development and production');
console.log('✅ ALWAYS enable IP whitelisting');
console.log('✅ ALWAYS monitor for suspicious activity');
console.log('✅ ALWAYS keep backups current\n');

console.log('📋 AFTER SETUP CHECKLIST:');
console.log('=========================');
console.log('□ New database user created');
console.log('□ Old "0.0.0.0/0" access removed');
console.log('□ Production database created');
console.log('□ .env file updated');
console.log('□ Connection tested successfully');
console.log('□ Monitoring alerts configured');
console.log('□ Backup policy enabled');
console.log('□ Old credentials deactivated\n');

console.log('🎉 Once completed, your database will be production-secure!');
console.log('');

// Offer to create .env backup
console.log('💡 TIP: This script can help update your .env file.');
console.log('Run with --update-env flag to automatically update:');
console.log('node scripts/mongodb-production-setup.js --update-env');

// Check if user wants to update .env
if (process.argv.includes('--update-env')) {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Backup original
    fs.writeFileSync(envPath + '.backup', envContent);
    console.log('✅ Created backup: .env.backup');
    
    // Update MONGO_URI
    envContent = envContent.replace(
      /MONGO_URI=.*/,
      `MONGO_URI=${newConnectionString}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env with new MongoDB connection string');
    console.log('⚠️  Remember to create the database user in Atlas first!');
    
  } catch (error) {
    console.log('❌ Error updating .env:', error.message);
  }
}
