require('dotenv').config({ path: './.env.cpanel' });
const emailService = require('./utils/emailService');

// Sample test data
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
        items: [
            {
                product: { name: 'iPhone 15 Pro Max Case', category: 'Phone Protection' },
                quantity: 2,
                price: 299.99
            },
            {
                product: { name: 'Fast Wireless Charger', category: 'Power & Charging' },
                quantity: 1,
                price: 159.99
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
        status: 'confirmed'
    },
    admin: {
        name: 'Admin User',
        email: 'admin@snappify.co.za'
    }
};

async function showEmailMenu() {
    console.log('\n🎯 SNAPPY EMAIL TESTING SYSTEM');
    console.log('=====================================\n');
    
    console.log('📧 Available Email Tests:');
    console.log('1. 🎉 Welcome Email (New User Registration)');
    console.log('2. 🛍️  Order Confirmation Email');
    console.log('3. 🚚 Order Shipped Email');
    console.log('4. ✅ Order Delivered Email');
    console.log('5. 🔐 Password Reset Email');
    console.log('6. 📞 Contact Form Submission (to Admin)');
    console.log('7. 🎁 Promotional Email');
    console.log('8. 📋 Newsletter Email');
    console.log('9. 💬 Support Ticket Response');
    console.log('10. 🛒 Abandoned Cart Reminder');
    console.log('11. ⭐ Review Request Email');
    console.log('12. 🎊 All Emails Test (Send All Types)');
    console.log('0. ❌ Exit\n');
}

async function testEmail(choice) {
    const recipientEmail = testData.user.email;
    
    try {
        switch(choice) {
            case '1':
                console.log('📤 Sending Welcome Email...');
                await emailService.sendWelcomeEmail(testData.user);
                break;
                
            case '2':
                console.log('📤 Sending Order Confirmation Email...');
                await emailService.sendOrderConfirmationEmail(testData.user, testData.order);
                break;
                
            case '3':
                console.log('📤 Sending Order Shipped Email...');
                await emailService.sendOrderShippedEmail(testData.user, {
                    ...testData.order,
                    trackingNumber: 'TRK123456789',
                    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
                });
                break;
                
            case '4':
                console.log('📤 Sending Order Delivered Email...');
                await emailService.sendOrderDeliveredEmail(testData.user, testData.order);
                break;
                
            case '5':
                console.log('📤 Sending Password Reset Email...');
                await emailService.sendPasswordResetEmail(testData.user);
                break;
                
            case '6':
                console.log('📤 Sending Contact Form Submission to Admin...');
                await emailService.sendContactFormEmail({
                    name: testData.user.name,
                    email: testData.user.email,
                    subject: 'Product Inquiry - iPhone Cases',
                    message: 'Hi, I would like to know more about your iPhone 15 Pro Max cases. Do you have different colors available?'
                });
                break;
                
            case '7':
                console.log('📤 Sending Promotional Email...');
                await emailService.sendPromotionalEmail(testData.user, {
                    subject: '🔥 Flash Sale: 30% Off All Phone Cases!',
                    title: 'Limited Time Offer',
                    content: 'Get 30% off all phone cases this weekend only! Use code FLASH30 at checkout.',
                    ctaText: 'Shop Now',
                    ctaUrl: 'https://snappify.co.za/products?category=phone-protection'
                });
                break;
                
            case '8':
                console.log('📤 Sending Newsletter Email...');
                await emailService.sendNewsletterEmail(testData.user, {
                    subject: '📱 New Arrivals: Latest Tech Accessories',
                    articles: [
                        {
                            title: 'New iPhone 15 Series Cases Now Available',
                            summary: 'Protect your new iPhone with our premium case collection.',
                            link: 'https://snappify.co.za/products/iphone-15-cases'
                        },
                        {
                            title: 'Fast Charging Solutions for Every Device',
                            summary: 'Discover our range of wireless and wired charging options.',
                            link: 'https://snappify.co.za/products?category=power-charging'
                        }
                    ]
                });
                break;
                
            case '9':
                console.log('📤 Sending Support Ticket Response...');
                await emailService.sendSupportTicketEmail(testData.user, {
                    ticketId: 'SUP-2025-001',
                    subject: 'Order Inquiry - Response',
                    response: 'Thank you for contacting Snappy support. Your order SNP-2025-001 has been processed and will ship within 24 hours. You will receive tracking information via email once it\'s dispatched.',
                    status: 'resolved'
                });
                break;
                
            case '10':
                console.log('📤 Sending Abandoned Cart Email...');
                await emailService.sendAbandonedCartEmail(testData.user, {
                    items: testData.order.items,
                    cartTotal: testData.order.totalAmount,
                    cartUrl: 'https://snappify.co.za/cart'
                });
                break;
                
            case '11':
                console.log('📤 Sending Review Request Email...');
                await emailService.sendReviewRequestEmail(testData.user, testData.order);
                break;
                
            case '12':
                console.log('📤 Sending ALL Email Types (This may take a moment)...\n');
                const emailTypes = [
                    { name: 'Welcome Email', func: () => emailService.sendWelcomeEmail(testData.user) },
                    { name: 'Order Confirmation', func: () => emailService.sendOrderConfirmationEmail(testData.user, testData.order) },
                    { name: 'Password Reset', func: () => emailService.sendPasswordResetEmail(testData.user) },
                    { name: 'Contact Form', func: () => emailService.sendContactFormEmail({
                        name: testData.user.name,
                        email: testData.user.email,
                        subject: 'Test Contact Form',
                        message: 'This is a test message from the email testing system.'
                    }) }
                ];
                
                for (const emailType of emailTypes) {
                    try {
                        console.log(`   📧 Sending ${emailType.name}...`);
                        await emailType.func();
                        console.log(`   ✅ ${emailType.name} sent successfully!`);
                    } catch (error) {
                        console.log(`   ❌ ${emailType.name} failed: ${error.message}`);
                    }
                    // Small delay between emails
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                break;
                
            default:
                console.log('❌ Invalid choice. Please try again.');
                return false;
        }
        
        console.log(`✅ Email sent successfully to: ${recipientEmail}`);
        console.log('📬 Check your inbox (and spam folder) for the test email!\n');
        return true;
        
    } catch (error) {
        console.error('❌ Email sending failed:');
        console.error('Error:', error.message);
        console.log('\n🔧 Make sure your email configuration is correct in .env.cpanel\n');
        return false;
    }
}

async function main() {
    console.log('🔍 Checking email configuration...');
    
    // Check if email service is properly configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Email configuration missing! Please check your .env.cpanel file.');
        return;
    }
    
    console.log('✅ Email configuration found!');
    console.log(`📧 Sender: ${process.env.EMAIL_USER}`);
    console.log(`📬 Test recipient: ${testData.user.email}\n`);
    
    while (true) {
        await showEmailMenu();
        
        // Simple input simulation - in real scenario you'd use readline
        console.log('Enter your choice (1-12, or 0 to exit):');
        console.log('For demo purposes, testing Welcome Email (option 1)...\n');
        
        const choice = '1'; // You can change this to test different emails
        
        if (choice === '0') {
            console.log('👋 Email testing completed. Goodbye!');
            break;
        }
        
        await testEmail(choice);
        
        // For demo, only run once
        console.log('🎯 Demo complete! To test other email types, edit the choice variable in the script.');
        break;
    }
}

// Run the test
main().catch(console.error);