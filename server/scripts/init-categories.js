const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

const categoryData = [
  // Main Categories
  {
    name: 'Power & Charging',
    slug: 'power-charging',
    description: 'Complete range of charging solutions for all your devices',
    image: 'https://via.placeholder.com/300x200?text=Power+%26+Charging',
    sortOrder: 1,
    parent: null
  },
  {
    name: 'Audio & Sound',
    slug: 'audio-sound',
    description: 'Premium audio accessories for superior sound experience',
    image: 'https://via.placeholder.com/300x200?text=Audio+%26+Sound',
    sortOrder: 2,
    parent: null
  },
  {
    name: 'Phone Protection',
    slug: 'phone-protection',
    description: 'Protect your device with our range of covers and screen protectors',
    image: 'https://via.placeholder.com/300x200?text=Phone+Protection',
    sortOrder: 3,
    parent: null
  },
  {
    name: 'Storage & Connectivity',
    slug: 'storage-connectivity',
    description: 'Storage solutions and connectivity accessories',
    image: 'https://via.placeholder.com/300x200?text=Storage+%26+Connectivity',
    sortOrder: 4,
    parent: null
  },
  
  // Subcategories for Power & Charging
  {
    name: 'Power Banks',
    slug: 'power-banks',
    description: 'Portable power banks for charging on the go',
    image: 'https://via.placeholder.com/300x200?text=Power+Banks',
    sortOrder: 11,
    parentName: 'Power & Charging'
  },
  {
    name: 'Wall Chargers',
    slug: 'wall-chargers',
    description: 'Fast and reliable wall chargers for home and office',
    image: 'https://via.placeholder.com/300x200?text=Wall+Chargers',
    sortOrder: 12,
    parentName: 'Power & Charging'
  },
  {
    name: 'Wireless Chargers',
    slug: 'wireless-chargers',
    description: 'Convenient wireless charging solutions',
    image: 'https://via.placeholder.com/300x200?text=Wireless+Chargers',
    sortOrder: 13,
    parentName: 'Power & Charging'
  },
  {
    name: 'Car Chargers',
    slug: 'car-chargers',
    description: 'Charge your devices while driving',
    image: 'https://via.placeholder.com/300x200?text=Car+Chargers',
    sortOrder: 14,
    parentName: 'Power & Charging'
  },
  {
    name: 'Charging Cables',
    slug: 'charging-cables',
    description: 'USB, Type-C, Lightning, HDMI and other cables',
    image: 'https://via.placeholder.com/300x200?text=Charging+Cables',
    sortOrder: 15,
    parentName: 'Power & Charging'
  },
  
  // Subcategories for Audio & Sound
  {
    name: 'Earphones & AirPods',
    slug: 'earphones-airpods',
    description: 'Wired and wireless earphones for every lifestyle',
    image: 'https://via.placeholder.com/300x200?text=Earphones+%26+AirPods',
    sortOrder: 21,
    parentName: 'Audio & Sound'
  },
  {
    name: 'Headphones & Headsets',
    slug: 'headphones-headsets',
    description: 'Over-ear headphones and gaming headsets',
    image: 'https://via.placeholder.com/300x200?text=Headphones+%26+Headsets',
    sortOrder: 22,
    parentName: 'Audio & Sound'
  },
  {
    name: 'Bluetooth Speakers',
    slug: 'bluetooth-speakers',
    description: 'Portable and home Bluetooth speakers',
    image: 'https://via.placeholder.com/300x200?text=Bluetooth+Speakers',
    sortOrder: 23,
    parentName: 'Audio & Sound'
  },
  
  // Subcategories for Phone Protection
  {
    name: 'Screen Protectors',
    slug: 'screen-protectors',
    description: 'Tempered glass and film screen protectors',
    image: 'https://via.placeholder.com/300x200?text=Screen+Protectors',
    sortOrder: 31,
    parentName: 'Phone Protection'
  },
  {
    name: 'Phone Covers & Cases',
    slug: 'phone-covers-cases',
    description: 'Protective cases and stylish covers for all phone models',
    image: 'https://via.placeholder.com/300x200?text=Phone+Covers+%26+Cases',
    sortOrder: 32,
    parentName: 'Phone Protection'
  },
  
  // Subcategories for Storage & Connectivity
  {
    name: 'Flash Drives',
    slug: 'flash-drives',
    description: 'USB flash drives for data storage and transfer',
    image: 'https://via.placeholder.com/300x200?text=Flash+Drives',
    sortOrder: 41,
    parentName: 'Storage & Connectivity'
  },
  {
    name: 'Memory Cards',
    slug: 'memory-cards',
    description: 'MicroSD and SD cards for expanding storage',
    image: 'https://via.placeholder.com/300x200?text=Memory+Cards',
    sortOrder: 42,
    parentName: 'Storage & Connectivity'
  },
  {
    name: 'OTG & Adapters',
    slug: 'otg-adapters',
    description: 'OTG cables and various adapters for connectivity',
    image: 'https://via.placeholder.com/300x200?text=OTG+%26+Adapters',
    sortOrder: 43,
    parentName: 'Storage & Connectivity'
  }
];

async function initializeCategories() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/snappy');
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Get product categories to verify alignment
    const productCategories = await Product.distinct('category');
    console.log('Product categories:', productCategories);

    // Create parent categories first
    const parentCategories = categoryData.filter(cat => !cat.parentName);
    const categoryIdMap = {};
    
    console.log('\nCreating parent categories...');
    for (const categoryInfo of parentCategories) {
      const category = new Category(categoryInfo);
      await category.save();
      categoryIdMap[categoryInfo.name] = category._id;
      console.log(`✅ Created parent category: ${categoryInfo.name}`);
    }

    // Create child categories with proper parent references
    const childCategories = categoryData.filter(cat => cat.parentName);
    
    console.log('\nCreating subcategories...');
    for (const categoryInfo of childCategories) {
      const parentId = categoryIdMap[categoryInfo.parentName];
      if (parentId) {
        const { parentName, ...categoryData } = categoryInfo;
        const category = new Category({
          ...categoryData,
          parent: parentId
        });
        await category.save();
        console.log(`✅ Created subcategory: ${categoryInfo.name} (under ${categoryInfo.parentName})`);
      } else {
        console.log(`❌ Parent category not found for: ${categoryInfo.name}`);
      }
    }

    // Update product counts for all categories
    console.log('\nUpdating product counts...');
    const allCategories = await Category.find({});
    for (const category of allCategories) {
      const productCount = await Product.countDocuments({ category: category.name });
      category.productCount = productCount;
      await category.save();
      console.log(`📊 ${category.name}: ${productCount} products`);
    }

    console.log('\n🎉 Categories initialized successfully!');
    
    // Display category tree
    console.log('\nCategory Structure:');
    const parentCats = await Category.find({ parent: null }).sort({ sortOrder: 1 });
    for (const parent of parentCats) {
      console.log(`📁 ${parent.name}`);
      const children = await Category.find({ parent: parent._id }).sort({ sortOrder: 1 });
      for (const child of children) {
        console.log(`  └─ ${child.name}`);
      }
    }
    
    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Error initializing categories:', error);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

// Run the initialization
initializeCategories();
