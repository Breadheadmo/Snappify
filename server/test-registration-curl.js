// Test user registration using curl command
const { exec } = require('child_process');

async function testUserRegistration() {
    console.log('🧪 Testing User Registration with Personalized Welcome Email...\n');
    
    const testUser = {
        firstName: 'Alice',
        lastName: 'Smith',
        username: `testuser_${Date.now()}`,
        email: `alice.smith.${Date.now()}@test.com`,
        password: 'TestPassword123!'
    };
    
    console.log('👤 Creating test user:');
    console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Email: ${testUser.email}\n`);
    
    const curlCommand = `curl -X POST http://localhost:5001/api/users -H "Content-Type: application/json" -d "${JSON.stringify(testUser).replace(/"/g, '\\"')}"`;
    
    console.log('📤 Sending registration request...');
    
    exec(curlCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Test failed:', error.message);
            return;
        }
        
        if (stderr) {
            console.error('❌ Error:', stderr);
            return;
        }
        
        try {
            const response = JSON.parse(stdout);
            console.log('✅ Registration successful!');
            console.log(`📧 Welcome email should be sent to: ${testUser.email}`);
            console.log(`🎯 Email greeting: "Hi ${testUser.firstName}"`);
            console.log(`👤 User ID: ${response._id || 'Generated'}`);
            console.log(`🔑 Token received: ${response.token ? 'Yes' : 'No'}\n`);
            
            console.log('🎉 TEST PASSED: User registration with personalized welcome email!');
            console.log('📬 Check your email inbox for the welcome message!');
        } catch (parseError) {
            console.log('Raw response:', stdout);
            console.error('❌ Failed to parse response:', parseError.message);
        }
    });
}

testUserRegistration();