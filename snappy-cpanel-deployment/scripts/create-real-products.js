const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Product = require('../models/productModel');
const User = require('../models/userModel');

// Real product catalog for South African e-commerce
const realProducts = [
  // Electronics - Smartphones
  {
    name: 'Samsung Galaxy S24 Ultra 512GB',
    image: '/images/products/samsung-s24-ultra.jpg',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Smartphones',
    description: 'The ultimate Android smartphone with S Pen, 200MP camera, and AI-powered features. Featuring a 6.8" Dynamic AMOLED display, Snapdragon 8 Gen 3 processor, and all-day battery life.',
    price: 25999,
    countInStock: 15,
    rating: 4.8,
    numReviews: 342,
    features: [
      '6.8" Dynamic AMOLED 2X Display',
      '200MP + 50MP + 12MP + 10MP Camera System',
      'Snapdragon 8 Gen 3 Processor',
      '512GB Storage + 12GB RAM',
      'S Pen Included',
      '5000mAh Battery with 45W Fast Charging'
    ],
    specifications: {
      display: '6.8" Dynamic AMOLED 2X',
      processor: 'Snapdragon 8 Gen 3',
      storage: '512GB',
      ram: '12GB',
      camera: '200MP Main + 50MP Ultrawide',
      battery: '5000mAh',
      os: 'Android 14'
    }
  },
  {
    name: 'iPhone 15 Pro Max 256GB',
    image: '/images/products/iphone-15-pro-max.jpg',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Smartphones',
    description: 'iPhone 15 Pro Max with titanium design, A17 Pro chip, and Pro camera system. Features the most advanced iPhone camera system and longest battery life ever.',
    price: 28999,
    countInStock: 12,
    rating: 4.9,
    numReviews: 198,
    features: [
      '6.7" Super Retina XDR Display',
      'A17 Pro Chip with 6-core GPU',
      'Pro Camera System with 5x Telephoto',
      '256GB Storage',
      'Titanium Design',
      'Action Button'
    ],
    specifications: {
      display: '6.7" Super Retina XDR',
      processor: 'A17 Pro',
      storage: '256GB',
      camera: '48MP Main + 12MP Ultrawide + 12MP Telephoto',
      battery: 'Up to 29 hours video playback',
      os: 'iOS 17'
    }
  },
  
  // Electronics - Laptops
  {
    name: 'MacBook Air 15" M3 512GB',
    image: '/images/products/macbook-air-15-m3.jpg',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    description: 'The new 15-inch MacBook Air with M3 chip delivers incredible performance in an impossibly thin design. Perfect for work, creativity, and everything in between.',
    price: 32999,
    countInStock: 8,
    rating: 4.7,
    numReviews: 89,
    features: [
      '15.3" Liquid Retina Display',
      'Apple M3 Chip with 10-core GPU',
      '512GB SSD Storage',
      '8GB Unified Memory',
      '18-hour Battery Life',
      'MagSafe 3 Charging'
    ],
    specifications: {
      display: '15.3" Liquid Retina',
      processor: 'Apple M3',
      storage: '512GB SSD',
      ram: '8GB',
      battery: 'Up to 18 hours',
      weight: '1.51kg'
    }
  },
  {
    name: 'Dell XPS 13 Plus Developer Edition',
    image: '/images/products/dell-xps-13-plus.jpg',
    brand: 'Dell',
    category: 'Electronics',
    subcategory: 'Laptops',
    description: 'Premium ultrabook with Intel 13th Gen processors, stunning OLED display, and Ubuntu pre-installed. Perfect for developers and professionals.',
    price: 24999,
    countInStock: 10,
    rating: 4.6,
    numReviews: 156,
    features: [
      '13.4" OLED Touch Display',
      'Intel Core i7-1360P Processor',
      '16GB LPDDR5 RAM',
      '512GB PCIe NVMe SSD',
      'Ubuntu 22.04 LTS',
      'Thunderbolt 4 Ports'
    ]
  },

  // Electronics - Audio
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    image: '/images/products/sony-wh1000xm5.jpg',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Audio',
    description: 'Industry-leading noise canceling with the new Integrated Processor V1 and 8 microphones. Exceptional call quality and 30-hour battery life.',
    price: 6999,
    countInStock: 25,
    rating: 4.8,
    numReviews: 445,
    features: [
      'Industry-leading Noise Canceling',
      '30-hour Battery Life',
      'Quick Charge (3 min = 3 hours)',
      'Multipoint Connection',
      'Speak-to-Chat Technology',
      'Touch Sensor Controls'
    ]
  },
  {
    name: 'AirPods Pro (3rd Generation)',
    image: '/images/products/airpods-pro-3.jpg',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Audio',
    description: 'AirPods Pro with next-generation H2 chip, Advanced Active Noise Cancellation, and Adaptive Transparency. Now with USB-C charging case.',
    price: 4999,
    countInStock: 30,
    rating: 4.7,
    numReviews: 267,
    features: [
      'H2 Chip for Advanced Audio',
      'Active Noise Cancellation',
      'Adaptive Transparency',
      'Spatial Audio',
      'USB-C Charging Case',
      'Up to 6 hours listening time'
    ]
  },

  // Home & Garden
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    image: '/images/products/dyson-v15-detect.jpg',
    brand: 'Dyson',
    category: 'Home & Garden',
    subcategory: 'Appliances',
    description: 'The most powerful, intelligent cordless vacuum. Reveals hidden dust with laser detection and automatically adapts suction power.',
    price: 12999,
    countInStock: 6,
    rating: 4.9,
    numReviews: 178,
    features: [
      'Laser Dust Detection',
      'Intelligent Suction Adjustment',
      'Up to 60 minutes runtime',
      'Advanced Whole-Machine Filtration',
      'LCD Screen with Real-time Reports',
      '5 Dyson-engineered Attachments'
    ]
  },
  {
    name: 'Nespresso Vertuo Plus Coffee Machine',
    image: '/images/products/nespresso-vertuo-plus.jpg',
    brand: 'Nespresso',
    category: 'Home & Garden',
    subcategory: 'Kitchen',
    description: 'Revolutionary coffee machine that reads each capsule and adjusts brewing parameters. Makes 5 different cup sizes from espresso to alto.',
    price: 3499,
    countInStock: 15,
    rating: 4.5,
    numReviews: 298,
    features: [
      'Centrifusion Extraction Technology',
      '5 Cup Sizes (40ml to 414ml)',
      'Automatic Capsule Recognition',
      '1.35L Water Tank',
      '20-second Heat-up Time',
      'Energy-saving Auto Off'
    ]
  },

  // Fashion & Beauty
  {
    name: 'Ray-Ban Aviator Classic Sunglasses',
    image: '/images/products/rayban-aviator-classic.jpg',
    brand: 'Ray-Ban',
    category: 'Fashion & Beauty',
    subcategory: 'Sunglasses',
    description: 'The original pilot sunglasses. Timeless design with crystal lenses and gold-tone frames. 100% UV protection.',
    price: 2299,
    countInStock: 40,
    rating: 4.6,
    numReviews: 523,
    features: [
      'Crystal Lens Technology',
      '100% UV Protection',
      'Gold-tone Metal Frame',
      'Adjustable Nose Pads',
      'Iconic Teardrop Shape',
      'Case and Cleaning Cloth Included'
    ]
  },
  {
    name: 'Nike Air Max 270 Running Shoes',
    image: '/images/products/nike-air-max-270.jpg',
    brand: 'Nike',
    category: 'Fashion & Beauty',
    subcategory: 'Footwear',
    description: 'Inspired by the Air Max 93 and Air Max 180, the Air Max 270 features Nike\'s biggest heel Air unit yet for a super-soft ride.',
    price: 2799,
    countInStock: 50,
    rating: 4.4,
    numReviews: 891,
    features: [
      'Max Air Unit in Heel',
      'Breathable Mesh Upper',
      'Foam Midsole',
      'Rubber Outsole',
      'Pull Tabs',
      'Available in Multiple Colors'
    ]
  },

  // Sports & Fitness
  {
    name: 'Fitbit Versa 4 Fitness Smartwatch',
    image: '/images/products/fitbit-versa-4.jpg',
    brand: 'Fitbit',
    category: 'Sports & Fitness',
    subcategory: 'Wearables',
    description: 'Advanced fitness smartwatch with built-in GPS, 6+ day battery life, and 40+ exercise modes. Includes 6 months Fitbit Premium.',
    price: 4299,
    countInStock: 20,
    rating: 4.3,
    numReviews: 234,
    features: [
      'Built-in GPS & GLONASS',
      '6+ Day Battery Life',
      '40+ Exercise Modes',
      'Daily Readiness Score',
      'Call, Text & App Notifications',
      '6 Months Fitbit Premium Included'
    ]
  },
  {
    name: 'Yoga Mat Pro - Extra Thick 8mm',
    image: '/images/products/yoga-mat-pro.jpg',
    brand: 'YogaLife',
    category: 'Sports & Fitness',
    subcategory: 'Exercise Equipment',
    description: 'Professional-grade yoga mat with superior grip and cushioning. Made from eco-friendly TPE material, perfect for all yoga styles.',
    price: 899,
    countInStock: 35,
    rating: 4.7,
    numReviews: 445,
    features: [
      'Extra Thick 8mm Cushioning',
      'Superior Grip Technology',
      'Eco-friendly TPE Material',
      'Non-slip Surface',
      '183cm x 61cm',
      'Carrying Strap Included'
    ]
  },

  // Books & Media
  {
    name: 'Kindle Paperwhite (11th Generation)',
    image: '/images/products/kindle-paperwhite-11.jpg',
    brand: 'Amazon',
    category: 'Books & Media',
    subcategory: 'E-readers',
    description: 'The most popular Kindle, now with a 6.8" display and adjustable warm light. Waterproof design with weeks of battery life.',
    price: 2799,
    countInStock: 18,
    rating: 4.8,
    numReviews: 1205,
    features: [
      '6.8" Glare-free Display',
      'Adjustable Warm Light',
      'Waterproof (IPX8)',
      'Weeks of Battery Life',
      'Kindle Unlimited Compatible',
      '8GB Storage (thousands of books)'
    ]
  }
];

// Connect to MongoDB and create real products
const createRealProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find an admin user to assign as the creator
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('🗑️ Clearing existing products...');
    await Product.deleteMany({});

    console.log('📦 Creating real product catalog...');

    // Add admin user to each product
    const productsWithUser = realProducts.map(product => ({
      ...product,
      user: adminUser._id,
      inStock: product.countInStock > 0,
      images: [product.image], // Convert single image to array
      isActive: true,
      featured: Math.random() > 0.7, // 30% chance to be featured
      tags: [product.brand.toLowerCase(), product.subcategory.toLowerCase()],
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const createdProducts = await Product.insertMany(productsWithUser);
    
    console.log(`✅ Created ${createdProducts.length} real products`);
    
    // Display product summary by category
    const categories = {};
    createdProducts.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = [];
      }
      categories[product.category].push({
        name: product.name,
        brand: product.brand,
        price: product.price,
        stock: product.countInStock
      });
    });

    console.log('\n📋 Product Catalog Summary:');
    Object.keys(categories).forEach(category => {
      console.log(`\n${category}:`);
      categories[category].forEach(product => {
        console.log(`  • ${product.brand} ${product.name}`);
        console.log(`    Price: R${product.price.toLocaleString()} | Stock: ${product.stock}`);
      });
    });

    console.log('\n🎉 Real product catalog created successfully!');
    console.log('\nFeatured products for homepage:');
    const featuredProducts = createdProducts.filter(p => p.featured);
    featuredProducts.forEach(product => {
      console.log(`  ⭐ ${product.brand} ${product.name} - R${product.price.toLocaleString()}`);
    });

    console.log('\n🛒 Your e-commerce store is now ready with real products!');
    console.log('💡 Next steps:');
    console.log('  1. Start your servers (backend & frontend)');
    console.log('  2. Browse the product catalog');
    console.log('  3. Place real orders with these products');
    console.log('  4. Test the complete order & tracking workflow');

  } catch (error) {
    console.error('❌ Error creating real products:', error.message);
    console.error(error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createRealProducts();
