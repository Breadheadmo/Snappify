require('dotenv').config({ path: './.env.cpanel' });
const emailService = require('./utils/emailService');

// Test data
const testData = {
    user: {
        _id: '64f7e1a2b3c4d5e6f7890123',
        name: 'Motheo Modisaesi',
        email: 'motheomodisaesi@gmail.com',
        resetPasswordToken: 'test-reset-token-123'
    },
    order: {
        _id: '64f7e1a2b3c4d5e6f7890456',
        orderNumber: 'SNP-2025-001',
        user: {
            name: 'Motheo Modisaesi',
            email: 'motheomodisaesi@gmail.com'
        },
        orderItems: [
            {
                _id: '64f7e1a2b3c4d5e6f7890111',
                name: 'iPhone 15 Pro Max Case', 
                category: 'Phone Protection',
                price: 299.99,
                quantity: 2,
                image: 'https://via.placeholder.com/150x150/007bff/ffffff?text=iPhone+Case'
            },
            {
                _id: '64f7e1a2b3c4d5e6f7890222',
                name: 'Fast Wireless Charger', 
                category: 'Power & Charging',
                price: 159.99,
                quantity: 1,
                image: 'https://via.placeholder.com/150x150/28a745/ffffff?text=Charger'
            }
        ],
        totalAmount: 759.97,
        currency: 'ZAR',
        shippingAddress: {
            street: '123 Main Street',
            city: 'Johannesburg',
            province: 'Gauteng',
            postalCode: '2000',
            country: 'South Africa'
        },
        paymentMethod: 'Paystack',
        status: 'confirmed',
        createdAt: new Date()
    }
};

// Quick test functions
async function testWelcomeEmail() {
    console.log('📤 Testing Welcome Email...');
    try {
        await emailService.sendWelcomeEmail(testData.user);
        console.log('✅ Welcome email sent successfully!');
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

async function testOrderConfirmation() {
    console.log('📤 Testing Order Confirmation Email...');
    try {
        await emailService.sendOrderConfirmationEmail(testData.order, testData.user);
        console.log('✅ Order confirmation email sent successfully!');
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

async function testPasswordReset() {
    console.log('📤 Testing Password Reset Email...');
    try {
        await emailService.sendPasswordResetEmail(testData.user);
        console.log('✅ Password reset email sent successfully!');
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

async function testContactForm() {
    console.log('📤 Testing Contact Form Email...');
    try {
        await emailService.sendContactFormEmail({
            name: testData.user.name,
            email: testData.user.email,
            subject: 'Product Inquiry - Test',
            message: 'This is a test message from the email testing system. Please ignore this test email.'
        });
        console.log('✅ Contact form email sent successfully!');
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

// Main menu
console.log('\n🎯 SNAPPY EMAIL QUICK TESTER');
console.log('==============================\n');
console.log('Available quick tests:');
console.log('• testWelcomeEmail()');
console.log('• testOrderConfirmation()');
console.log('• testPasswordReset()');
console.log('• testContactForm()');
console.log('\nTo run a test, call the function name in Node.js console.');
console.log('Example: testWelcomeEmail()\n');

console.log('📧 All emails will be sent to:', testData.user.email);
console.log('🔧 Configuration loaded from: .env.cpanel\n');

// Export functions for interactive use
module.exports = {
    testWelcomeEmail,
    testOrderConfirmation,
    testPasswordReset,
    testContactForm,
    testData
};