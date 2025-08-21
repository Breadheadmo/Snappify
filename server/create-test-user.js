const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Check if test user exists
    const testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      
      const newUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123', // This will be hashed by the User model pre-save middleware
        isAdmin: false
      });
      
      await newUser.save();
      console.log('Test user created successfully!');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    } else {
      console.log('Test user already exists');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    }
    
    // Check total users
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
