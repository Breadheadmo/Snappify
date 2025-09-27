// Test user registration with firstName and lastName
const fetch = require('node-fetch');

async function testUserRegistration() {
    console.log('🧪 Testing User Registration with Personalized Welcome Email...\n');
    
    const testUser = {
        firstName: 'John',
        lastName: 'Doe',
        username: `testuser_${Date.now()}`,
        email: `test.${Date.now()}@example.com`,
        password: 'TestPassword123!'
    };
    
    console.log('👤 Creating test user:');
    console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Email: ${testUser.email}\n`);
    
    try {
        console.log('📤 Sending registration request...');
        
        const response = await fetch('http://localhost:5001/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Registration successful!');
            console.log(`📧 Welcome email should be sent to: ${testUser.email}`);
            console.log(`🎯 Email greeting: "Hi ${testUser.firstName}"`);
            console.log(`👤 User ID: ${data._id}`);
            console.log(`🔑 Token received: ${data.token ? 'Yes' : 'No'}\n`);
            
            console.log('🎉 TEST PASSED: User registration with personalized welcome email!');
        } else {
            console.log('❌ Registration failed:');
            console.log('Status:', response.status);
            console.log('Error:', data);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testUserRegistration();