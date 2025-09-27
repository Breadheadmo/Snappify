// Simple MongoDB test
console.log('Starting MongoDB test script...');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Loaded environment variables');
console.log(`MONGO_URI: ${process.env.MONGO_URI ? 'Found' : 'Not found'}`);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
    
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
    console.log('Test document created:');
    console.log(result);
    console.log('MongoDB test completed successfully');
    
    // Exit cleanly
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error(`MongoDB connection error: ${err.message}`);
    console.error(err);
    process.exit(1);
  });
