// Test registration with proper error handling and response parsing
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testRegistrationWithEmail() {
    console.log('🧪 Testing User Registration & Welcome Email...\n');
    
    const testUser = {
        firstName: 'Sarah',
        lastName: 'Johnson',
        username: `testuser_${Date.now()}`,
        email: 'motheomodisaesi@gmail.com', // Use your actual email for testing
        password: 'testpass123'
    };

    console.log('👤 Test User Data:');
    console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Email: ${testUser.email}\n`);

    try {
        console.log('📤 Sending registration request to server...');
        
        const curlCommand = `curl -X POST http://localhost:5001/api/users ` +
            `-H "Content-Type: application/json" ` +
            `-d "{\\"firstName\\":\\"${testUser.firstName}\\",\\"lastName\\":\\"${testUser.lastName}\\",\\"username\\":\\"${testUser.username}\\",\\"email\\":\\"${testUser.email}\\",\\"password\\":\\"${testUser.password}\\"}" ` +
            `--silent --show-error`;

        const { stdout, stderr } = await execPromise(curlCommand);
        
        console.log('📋 Server Response:');
        if (stdout) {
            try {
                const response = JSON.parse(stdout);
                console.log('✅ Registration Response:', JSON.stringify(response, null, 2));
                
                if (response._id || response.id) {
                    console.log('\n🎉 SUCCESS: User created successfully!');
                    console.log('📧 Check your email for personalized welcome message:');
                    console.log(`   • Subject: Welcome to Snappify`);
                    console.log(`   • Greeting: "Hi ${testUser.firstName}!"`);
                    console.log(`   • Content: Personalized welcome message`);
                } else {
                    console.log('⚠️  User creation response unclear:', response);
                }
            } catch (parseError) {
                console.log('📄 Raw response:', stdout);
            }
        }
        
        if (stderr) {
            console.log('⚠️  Stderr:', stderr);
        }

    } catch (error) {
        console.error('❌ Registration test failed:');
        if (error.stdout) console.log('Response:', error.stdout);
        if (error.stderr) console.log('Error:', error.stderr);
        console.log('Details:', error.message);
    }
}

// Test password reset as well
async function testPasswordReset() {
    console.log('\n🔐 Testing Password Reset Email...\n');
    
    try {
        const curlCommand = `curl -X POST http://localhost:5001/api/users/forgot-password ` +
            `-H "Content-Type: application/json" ` +
            `-d "{\\"email\\":\\"motheomodisaesi@gmail.com\\"}" ` +
            `--silent --show-error`;

        const { stdout, stderr } = await execPromise(curlCommand);
        
        console.log('📋 Password Reset Response:');
        if (stdout) {
            try {
                const response = JSON.parse(stdout);
                console.log('✅ Response:', JSON.stringify(response, null, 2));
                
                if (response.success) {
                    console.log('\n🎉 SUCCESS: Password reset email sent!');
                    console.log('📧 Check your email for personalized reset message');
                }
            } catch (parseError) {
                console.log('📄 Raw response:', stdout);
            }
        }
        
        if (stderr) {
            console.log('⚠️  Stderr:', stderr);
        }

    } catch (error) {
        console.error('❌ Password reset test failed:', error.message);
    }
}

async function runAllTests() {
    await testRegistrationWithEmail();
    await testPasswordReset();
    
    console.log('\n✨ Testing Complete!');
    console.log('📬 Check your inbox (motheomodisaesi@gmail.com) for:');
    console.log('   1. Welcome email with personalized greeting');
    console.log('   2. Password reset email (if you have an existing account)');
}

runAllTests();