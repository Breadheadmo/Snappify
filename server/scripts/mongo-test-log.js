// Simple MongoDB test with logging
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Setup logging
const logFile = 'mongo-test-log.txt';
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

// Clear previous log
fs.writeFileSync(logFile, '');

// Start logging
log('Starting MongoDB test script...');

// Load environment variables
dotenv.config();

log('Loaded environment variables');
log(`MONGO_URI: ${process.env.MONGO_URI ? 'Found' : 'Not found'}`);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    log('MongoDB connected successfully');
    
    // Create a simple test model
    const TestSchema = new mongoose.Schema({
      name: String,
      date: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('Test', TestSchema);
    
    // Add a test document
    return Test.create({ name: 'Test Item' });
  })
  .then(result => {
    log('Test document created:');
    log(JSON.stringify(result, null, 2));
    log('MongoDB test completed successfully');
    
    // Exit cleanly
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    log(`MongoDB connection error: ${err.message}`);
    log(err.stack);
    process.exit(1);
  });
