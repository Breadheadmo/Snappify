const mongoose = require('mongoose');
const User = require('./models/userModel');
require('dotenv').config();

const updateTestUserToAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the test user
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (user) {
      // Update user to be admin
      user.isAdmin = true;
      await user.save();
      console.log('✅ Test user updated to admin:', {
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
      });
    } else {
      console.log('❌ Test user not found, creating admin user...');
      
      // Create new admin user
      user = new User({
        username: 'admin',
        email: 'test@example.com',
        password: 'password123',
        isAdmin: true
      });
      
      await user.save();
      console.log('✅ Admin user created:', {
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
      });
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
};

updateTestUserToAdmin();
