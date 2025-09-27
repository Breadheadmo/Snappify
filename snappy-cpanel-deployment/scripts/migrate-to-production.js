#!/usr/bin/env node

/**
 * Database Migration Script
 * Migrates data from development to production database
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

const OLD_MONGO_URI = 'mongodb+srv://breadheadmo:Sabbathworld3500@cluster0.rks24ra.mongodb.net/Snappy?retryWrites=true&w=majority&appName=Cluster0';
const NEW_MONGO_URI = 'mongodb+srv://snappy-prod-npcsgf:352a585ee69c16664ac3eb22288544f2Wy7I9UXc5s8@cluster0.rks24ra.mongodb.net/Snappy-Production?retryWrites=true&w=majority&appName=Cluster0';

async function migrateData() {
  console.log('🔄 Starting Database Migration');
  console.log('==============================\n');

  try {
    // Connect to old database
    console.log('📡 Connecting to old database...');
    const oldConnection = await mongoose.createConnection(OLD_MONGO_URI);
    console.log('✅ Connected to old database\n');

    // Connect to new database
    console.log('📡 Connecting to new database...');
    const newConnection = await mongoose.createConnection(NEW_MONGO_URI);
    console.log('✅ Connected to new database\n');

    // Create models for both databases
    const OldUser = oldConnection.model('User', User.schema);
    const OldProduct = oldConnection.model('Product', Product.schema);
    const OldOrder = oldConnection.model('Order', Order.schema);

    const NewUser = newConnection.model('User', User.schema);
    const NewProduct = newConnection.model('Product', Product.schema);
    const NewOrder = newConnection.model('Order', Order.schema);

    // Migrate Users
    console.log('👥 Migrating users...');
    const users = await OldUser.find({});
    if (users.length > 0) {
      // Only migrate non-sensitive test data
      const safeUsers = users.filter(user => 
        user.email.includes('@example.com') || 
        user.email.includes('@test.com') ||
        user.isAdmin
      );
      
      if (safeUsers.length > 0) {
        await NewUser.insertMany(safeUsers);
        console.log(`✅ Migrated ${safeUsers.length} users (filtered for safety)`);
      } else {
        console.log('⚠️  No safe users to migrate (avoiding real user data)');
      }
    } else {
      console.log('📄 No users found to migrate');
    }

    // Migrate Products
    console.log('\n📦 Migrating products...');
    const products = await OldProduct.find({});
    if (products.length > 0) {
      await NewProduct.insertMany(products);
      console.log(`✅ Migrated ${products.length} products`);
    } else {
      console.log('📄 No products found to migrate');
    }

    // Skip Orders (they contain sensitive payment data)
    console.log('\n🛒 Skipping orders migration (contains sensitive payment data)');
    console.log('   Orders will be created fresh in production');

    // Create default admin user for production
    console.log('\n👤 Creating default admin user...');
    const adminExists = await NewUser.findOne({ email: 'admin@snappy.com' });
    
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const adminPassword = await bcrypt.hash('Admin123!Production', 12);
      
      const adminUser = new NewUser({
        username: 'admin',
        email: 'admin@snappy.com',
        password: adminPassword,
        isAdmin: true,
        firstName: 'Admin',
        lastName: 'User'
      });
      
      await adminUser.save();
      console.log('✅ Created production admin user');
      console.log('   Email: admin@snappy.com');
      console.log('   Password: Admin123!Production');
      console.log('   ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
    } else {
      console.log('📄 Admin user already exists');
    }

    // Close connections
    await oldConnection.close();
    await newConnection.close();

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update your .env file with the new MONGO_URI');
    console.log('2. Test your application with the new database');
    console.log('3. Change the admin password after first login');
    console.log('4. Deactivate the old database user for security');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Check if user wants to run migration
if (process.argv.includes('--migrate')) {
  migrateData();
} else {
  console.log('🔄 Database Migration Tool');
  console.log('==========================\n');
  console.log('This script will migrate data from your development database');
  console.log('to your new production database.\n');
  console.log('⚠️  IMPORTANT SAFETY MEASURES:');
  console.log('- Only migrates safe test users and admin accounts');
  console.log('- Migrates all products');
  console.log('- SKIPS orders (sensitive payment data)');
  console.log('- Creates a new admin user for production\n');
  console.log('To run migration:');
  console.log('node scripts/migrate-to-production.js --migrate');
}
