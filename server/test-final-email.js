const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testEmailSystem() {
    console.log('🎯 Final Email System Test');
    console.log('==========================\n');
    
    // Test 1: Register a new user with unique email (using a random number)
    const randomNum = Math.floor(Math.random() * 10000);
    const testEmail = `test${randomNum}@example.com`;
    
    const testUser = {
        firstName: 'Emma',
        lastName: 'Wilson', 
        username: `user_${Date.now()}`,
        email: testEmail,
        password: 'TestPass123!'
    };

    console.log('📝 Test 1: User Registration with Welcome Email');
    console.log(`   👤 Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   📧 Email: ${testUser.email}`);
    console.log(`   👤 Username: ${testUser.username}\n`);

    try {
        const registrationCommand = `curl -X POST http://localhost:5001/api/users ` +
            `-H "Content-Type: application/json" ` +
            `-d "{\\"firstName\\":\\"${testUser.firstName}\\",\\"lastName\\":\\"${testUser.lastName}\\",\\"username\\":\\"${testUser.username}\\",\\"email\\":\\"${testUser.email}\\",\\"password\\":\\"${testUser.password}\\"}"`;

        console.log('📤 Sending registration request...');
        const registrationResult = await execPromise(registrationCommand);
        
        console.log('✅ Registration Response:');
        try {
            const response = JSON.parse(registrationResult.stdout);
            console.log(JSON.stringify(response, null, 2));
            
            if (response.message === 'User registered successfully' || response.user) {
                console.log('🎉 SUCCESS: User registered! Welcome email should be sent!\n');
            } else {
                console.log('⚠️  Registration may not have triggered welcome email\n');
            }
        } catch (e) {
            console.log('Raw response:', registrationResult.stdout);
        }

    } catch (error) {
        console.log('❌ Registration failed:', error.message, '\n');
    }

    // Test 2: Password reset with existing user
    console.log('🔐 Test 2: Password Reset Email');
    console.log(`   📧 Email: motheomodisaesi@gmail.com (real email for testing)\n`);

    try {
        const resetCommand = `curl -X POST http://localhost:5001/api/users/forgot-password ` +
            `-H "Content-Type: application/json" ` +
            `-d "{\\"email\\":\\"motheomodisaesi@gmail.com\\"}"`;

        console.log('📤 Sending password reset request...');
        const resetResult = await execPromise(resetCommand);
        
        console.log('✅ Password Reset Response:');
        try {
            const response = JSON.parse(resetResult.stdout);
            console.log(JSON.stringify(response, null, 2));
            
            if (response.success || response.message.includes('sent')) {
                console.log('🎉 SUCCESS: Password reset email sent!\n');
            }
        } catch (e) {
            console.log('Raw response:', resetResult.stdout);
        }

    } catch (error) {
        console.log('❌ Password reset failed:', error.message, '\n');
    }

    console.log('✨ Email Testing Complete!');
    console.log('📬 Check your email inbox for:');
    console.log('   1. Welcome email with "Hi Emma" greeting (if registration succeeded)');
    console.log('   2. Password reset email with personalized greeting');
}

testEmailSystem();