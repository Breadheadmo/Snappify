require('dotenv').config({ path: './.env.cpanel' });
const nodemailer = require('nodemailer');

async function testEmailConfig() {
    console.log('🔍 Testing Email Configuration...\n');
    
    // Display current configuration (hiding password)
    console.log('📧 Email Settings:');
    console.log(`   Host: ${process.env.EMAIL_HOST}`);
    console.log(`   Port: ${process.env.EMAIL_PORT}`);
    console.log(`   User: ${process.env.EMAIL_USER}`);
    console.log(`   Password: ${'*'.repeat(process.env.EMAIL_PASS?.length || 0)}`);
    console.log(`   Support: ${process.env.SUPPORT_EMAIL}`);
    console.log(`   Admin: ${process.env.ADMIN_EMAIL}\n`);

    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        // Test connection
        console.log('🔐 Testing SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!\n');

        // Send test email
        console.log('📤 Sending test email...');
        const info = await transporter.sendMail({
            from: `"Snappy Ecommerce" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: "🎉 Email Configuration Test - Success!",
            html: `
                <h2>🎉 Congratulations!</h2>
                <p>Your Snappy ecommerce email system is now fully configured and working!</p>
                <p><strong>✅ Test completed successfully at:</strong> ${new Date().toLocaleString()}</p>
                <hr>
                <p><small>This is an automated test from your Snappy ecommerce application.</small></p>
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log('\n🎉 EMAIL CONFIGURATION COMPLETE!');
        console.log('Your email system is ready for production.');

    } catch (error) {
        console.error('❌ Email test failed:');
        console.error('Error:', error.message);
        console.log('\n🔧 Troubleshooting Tips:');
        console.log('1. Check your Gmail App Password is correct');
        console.log('2. Ensure 2-Factor Authentication is enabled');
        console.log('3. Verify the email address is correct');
        console.log('4. Check your internet connection');
    }
}

testEmailConfig();