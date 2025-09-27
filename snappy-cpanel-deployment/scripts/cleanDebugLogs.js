const fs = require('fs');
const path = require('path');

// Files to clean debug logs from
const filesToClean = [
  'routes/cartRoutes.js',
  'controllers/paymentController.js',
  'config/paystack.js',
  'controllers/orderController.js',
  'utils/emailService.js',
  'server.js'
];

// Patterns to remove
const debugPatterns = [
  /console\.log\([^)]*\);?\s*\n?/g,
  /console\.error\([^)]*\);?\s*\n?/g,
  /console\.warn\([^)]*\);?\s*\n?/g,
  /console\.info\([^)]*\);?\s*\n?/g,
  /console\.debug\([^)]*\);?\s*\n?/g
];

function cleanFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    // Remove debug patterns
    debugPatterns.forEach(pattern => {
      content = content.replace(pattern, '');
    });
    
    // Remove empty lines that might be left behind
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Cleaned debug logs from: ${filePath}`);
    } else {
      console.log(`📄 No debug logs found in: ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Error cleaning ${filePath}:`, error.message);
  }
}

console.log('🧹 Starting debug log cleanup...\n');

filesToClean.forEach(file => {
  cleanFile(file);
});

console.log('\n✅ Debug log cleanup completed!');
console.log('\n⚠️  Remember to:');
console.log('1. Test your application thoroughly');
console.log('2. Add proper error handling where needed');
console.log('3. Use the productionLogger for any necessary logging');
