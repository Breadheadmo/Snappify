require('dotenv').config({ path: './.env.cpanel' });
const { sendPasswordResetEmail } = require('./utils/emailService');

async function testPasswordResetEmail() {
    console.log('🔐 Testing Personalized Password Reset Email...\n');

    const testUser = {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'motheomodisaesi@gmail.com',
        username: 'sarahjohnson'
    };

    const resetToken = 'test-reset-token-12345';

    console.log('👤 Test User:');
    console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   Email: ${testUser.email}\n`);

    try {
        await sendPasswordResetEmail(testUser, resetToken);
        console.log('✅ Personalized password reset email sent successfully!');
        console.log('📧 Check your inbox for: "Hi Sarah" greeting');
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
    }
}

testPasswordResetEmail();