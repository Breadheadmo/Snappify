// Test registration and welcome email functionality
require('dotenv').config({ path: './.env.cpanel' });
const mongoose = require('mongoose');
const User = require('./models/userModel');
const { sendWelcomeEmail } = require('./utils/emailService');

async function testFullRegistrationFlow() {
    console.log('🔗 Testing Full Registration with Email Flow...\n');
    
    try {
        // Connect to MongoDB
        console.log('📊 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        // Test user data
        const testUserData = {
            firstName: 'Alice',
            lastName: 'Johnson',
            username: 'alice_test_' + Date.now(),
            email: 'motheomodisaesi@gmail.com', // Use your email for testing
            password: 'testpassword123'
        };

        console.log('👤 Creating test user...');
        console.log(`   Name: ${testUserData.firstName} ${testUserData.lastName}`);
        console.log(`   Username: ${testUserData.username}`);
        console.log(`   Email: ${testUserData.email}\n`);

        // Create user (this simulates the registration process)
        const user = await User.create({
            firstName: testUserData.firstName,
            lastName: testUserData.lastName,
            username: testUserData.username,
            email: testUserData.email,
            password: testUserData.password,
        });

        console.log('✅ User created successfully!\n');

        // Send welcome email (this simulates what happens in the controller)
        console.log('📧 Sending personalized welcome email...');
        await sendWelcomeEmail(user);
        console.log('✅ Welcome email sent successfully!\n');

        console.log('🎉 REGISTRATION FLOW TEST COMPLETE!');
        console.log('📬 Check your inbox for:');
        console.log(`   • Personalized greeting: "Hi ${testUserData.firstName}!"`);
        console.log(`   • Welcome to Snappify message`);
        console.log(`   • Professional email layout\n`);

        // Clean up - remove test user
        await User.findByIdAndDelete(user._id);
        console.log('🧹 Test user cleaned up');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('📊 MongoDB connection closed');
    }
}

// Run the test
testFullRegistrationFlow();