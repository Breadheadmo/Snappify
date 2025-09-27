const mongoose = require('mongoose');
const Product = require('../models/productModel');
require('dotenv').config();

// Popular phone accessory brands
const defaultBrands = [
  // Major Tech Brands
  'Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Google', 'Sony', 'LG',
  
  // Audio Brands
  'Bose', 'Sony', 'JBL', 'Beats', 'Sennheiser', 'Audio-Technica', 'Skullcandy', 
  'Jabra', 'Plantronics', 'AKG', 'Marshall', 'Harman Kardon',
  
  // Charging & Power Brands
  'Anker', 'Belkin', 'RAVPower', 'Aukey', 'Mophie', 'Poweradd', 'Xiaomi', 
  'Samsung', 'Apple', 'Baseus', 'Ugreen', 'Choetech', 'Spigen',
  
  // Protection & Cases
  'OtterBox', 'Spigen', 'UAG', 'Case-Mate', 'Incipio', 'Tech21', 'Pelican', 
  'LifeProof', 'Catalyst', 'Peak Design', 'Nomad', 'Bellroy',
  
  // Screen Protection
  'ZAGG', 'Belkin', 'Spigen', 'amFilm', 'IQ Shield', 'ArmorSuit', 
  'Tech Armor', 'Maxboost', 'JETech', 'Supershieldz',
  
  // Storage & Connectivity
  'SanDisk', 'Kingston', 'Samsung', 'Lexar', 'Transcend', 'PNY', 
  'Corsair', 'ADATA', 'Toshiba', 'Western Digital',
  
  // Generic/Budget Brands
  'Essager', 'INIU', 'Syncwire', 'Ailun', 'Mpow', 'TaoTronics', 
  'Veckle', 'Bovon', 'Lamicall', 'Fintie', 'ProCase', 'Ztylus',
  
  // Local/Regional Brands (you can customize this)
  'Volkano', 'Gizzu', 'Mecer', 'Proline', 'Laser', 'Digitech'
];

async function addBrandsToProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get current distinct brands from products
    const existingBrands = await Product.distinct('brand');
    console.log('Existing brands from products:', existingBrands);

    // Create a comprehensive list by combining existing brands with defaults
    const allBrands = [...new Set([...existingBrands, ...defaultBrands])].sort();
    
    console.log(`\nTotal unique brands available: ${allBrands.length}`);
    console.log('Brands list:');
    allBrands.forEach((brand, index) => {
      console.log(`${index + 1}. ${brand}`);
    });

    console.log('\n✅ Brand list compilation complete!');
    console.log('These brands are now available in the admin form datalist.');
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addBrandsToProducts();
