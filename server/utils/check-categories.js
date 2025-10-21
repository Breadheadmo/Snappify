const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
require('dotenv').config();

const checkCategories = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...\n');

    // ✅ FIXED: Use MONGO_URI instead of MONGODB_URI
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/snappify';
    
    console.log('📡 Using MongoDB URI:', mongoUri.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB');
    console.log('🌐 Database:', mongoUri.split('/').pop().split('?')[0], '\n');

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // Fetch all categories with parent information
    const categories = await Category.find().populate('parent', 'name').sort({ sortOrder: 1, name: 1 });

    console.log(`📊 Total Categories: ${categories.length}\n`);

    if (categories.length === 0) {
      console.log('⚠️  No categories found in database!\n');
      console.log('💡 To add categories, you can:');
      console.log('   1. Use the Admin Dashboard: http://localhost:3000/admin/categories');
      console.log('   2. Run the initialization script: npm run init-categories\n');
    } else {
      // Display categories in a table
      console.log('📋 Categories List:\n');
      console.log('═'.repeat(110));
      console.log(
        '│',
        'Name'.padEnd(30),
        '│',
        'Slug'.padEnd(25),
        '│',
        'Parent'.padEnd(20),
        '│',
        'Status'.padEnd(10),
        '│',
        'Products'.padEnd(8),
        '│'
      );
      console.log('═'.repeat(110));

      categories.forEach((cat, index) => {
        const name = cat.name.length > 28 ? cat.name.substring(0, 25) + '...' : cat.name;
        const slug = cat.slug.length > 23 ? cat.slug.substring(0, 20) + '...' : cat.slug;
        const parent = cat.parent 
          ? (cat.parent.name.length > 18 ? cat.parent.name.substring(0, 15) + '...' : cat.parent.name) 
          : '-';
        const status = cat.isActive ? '✅ Active' : '❌ Inactive';
        const products = (cat.productCount || 0).toString();

        console.log(
          '│',
          name.padEnd(30),
          '│',
          slug.padEnd(25),
          '│',
          parent.padEnd(20),
          '│',
          status.padEnd(10),
          '│',
          products.padEnd(8),
          '│'
        );

        if (index < categories.length - 1) {
          console.log('├' + '─'.repeat(108) + '┤');
        }
      });

      console.log('═'.repeat(110));

      // Calculate statistics
      const activeCategories = categories.filter((c) => c.isActive).length;
      const inactiveCategories = categories.filter((c) => !c.isActive).length;
      const parentCategories = categories.filter((c) => !c.parent).length;
      const subcategories = categories.filter((c) => c.parent).length;
      const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

      console.log('\n📈 Statistics:');
      console.log('─'.repeat(50));
      console.log(`   📁 Parent Categories:    ${parentCategories}`);
      console.log(`   📂 Subcategories:        ${subcategories}`);
      console.log(`   ✅ Active Categories:    ${activeCategories}`);
      console.log(`   ❌ Inactive Categories:  ${inactiveCategories}`);
      console.log(`   📦 Total Products:       ${totalProducts}`);
      console.log('─'.repeat(50));

      // Display category tree
      const topLevelCategories = categories.filter((c) => !c.parent);
      
      if (topLevelCategories.length > 0) {
        console.log('\n🌳 Category Hierarchy:\n');
        console.log('═'.repeat(70));
        
        for (const parent of topLevelCategories) {
          const children = categories.filter(
            (c) => c.parent && c.parent._id.toString() === parent._id.toString()
          );
          
          const statusIcon = parent.isActive ? '✅' : '❌';
          console.log(`${statusIcon} 📁 ${parent.name} (${parent.productCount || 0} products)`);
          
          if (children.length > 0) {
            children.forEach((child, idx) => {
              const isLast = idx === children.length - 1;
              const prefix = isLast ? '   └─' : '   ├─';
              const childStatusIcon = child.isActive ? '✅' : '❌';
              console.log(`${prefix} ${childStatusIcon} ${child.name} (${child.productCount || 0} products)`);
            });
          } else {
            console.log('   └─ (no subcategories)');
          }
          console.log('');
        }
        console.log('═'.repeat(70));
      }

      // Show categories without products
      const emptyCategories = categories.filter((c) => !c.productCount || c.productCount === 0);
      if (emptyCategories.length > 0) {
        console.log('\n⚠️  Categories with No Products:');
        emptyCategories.forEach((cat) => {
          console.log(`   - ${cat.name}`);
        });
        console.log('');
      }

      // Show inactive categories
      const inactiveList = categories.filter((c) => !c.isActive);
      if (inactiveList.length > 0) {
        console.log('\n❌ Inactive Categories:');
        inactiveList.forEach((cat) => {
          console.log(`   - ${cat.name}`);
        });
        console.log('');
      }

      // Show image status
      const withImages = categories.filter((c) => c.image && c.image.trim() !== '').length;
      const withoutImages = categories.length - withImages;
      
      if (withoutImages > 0) {
        console.log('\n🖼️  Image Status:');
        console.log(`   ✅ With Images: ${withImages}`);
        console.log(`   ❌ Without Images: ${withoutImages}`);
        
        const noImageList = categories.filter((c) => !c.image || c.image.trim() === '');
        if (noImageList.length > 0 && noImageList.length <= 10) {
          console.log('\n   Categories missing images:');
          noImageList.forEach((cat) => {
            console.log(`   - ${cat.name}`);
          });
        }
        console.log('');
      }
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check if MongoDB Atlas connection string is correct');
    console.error('   2. Verify MONGO_URI in .env file');
    console.error('   3. Ensure categoryModel.js exists in models folder');
    console.error('   4. Check network connection and MongoDB Atlas IP whitelist');
    console.error('   5. Verify database username and password are correct\n');
    
    if (error.stack) {
      console.error('\n📜 Full Error Stack:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
};

// Run the check
console.log('\n🚀 Starting Category Check...\n');
checkCategories();