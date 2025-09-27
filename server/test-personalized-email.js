require('dotenv').config({ path: './.env.cpanel' });
const { sendWelcomeEmail } = require('./utils/emailService');

async function testPersonalizedEmail() {
    console.log('🧪 Testing Personalized Welcome Email...\n');

    const testUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'motheomodisaesi@gmail.com',
        username: 'johndoe'
    };

    console.log('👤 Test User:');
    console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Username: ${testUser.username}\n`);

    try {
        await sendWelcomeEmail(testUser);
        console.log('✅ Personalized welcome email sent successfully!');
        console.log('📧 Check your inbox for: "Hi John! 👋" greeting');
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
    }
}

testPersonalizedEmail();