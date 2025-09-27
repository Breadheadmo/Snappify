# 📧 Nodemailer Email Configuration Guide for Snappy
=====================================================

## 🚀 Quick Setup

### 1. Gmail Configuration (Recommended for Development)

**Step 1:** Enable 2-Factor Authentication on your Gmail account
**Step 2:** Generate an App Password:
- Go to Google Account settings
- Security → 2-Step Verification → App passwords
- Select "Mail" and generate a password

**Step 3:** Update your `.env` file:

```env
# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password-here
SUPPORT_EMAIL=support@snappy.co.za
ADMIN_EMAIL=admin@snappy.co.za
```

### 2. Production Email Providers

#### Option A: SendGrid (Recommended for Production)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Option B: Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASS=your-mailgun-password
```

#### Option C: AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-ses-username
EMAIL_PASS=your-aws-ses-password
```

## 📧 Available Email Functions

### Core Order Emails
- `sendOrderConfirmationEmail(order, user)` - Send when order is placed
- `sendOrderStatusEmail(order, user, oldStatus, newStatus)` - Send when order status changes
- `sendShippingConfirmationEmail(order, user, shippingDetails)` - Send when order ships
- `sendOrderTrackingEmail(order, user, trackingInfo)` - Send tracking updates
- `sendOrderCancellationEmail(order, user, reason)` - Send when order is cancelled
- `sendDeliveryNotification(order, user)` - Send when package is delivered

### User Management Emails
- `sendWelcomeEmail(user)` - Send to new users after registration
- `sendEmailVerification(user, verificationToken)` - Send email verification link
- `sendPasswordResetEmail(user, resetToken)` - Send password reset link
- `sendSecurityAlert(user, alertType, details)` - Send security notifications

### Marketing & Engagement
- `sendNewsletterConfirmation(email)` - Confirm newsletter subscription
- `sendWishlistReminder(user, wishlistItems)` - Remind users about wishlist items
- `sendPromotionalEmail(recipients, subject, content)` - Send bulk promotional emails

### Administrative
- `sendLowStockAlert(products)` - Alert admin about low stock
- `testEmailConfiguration()` - Test email setup

## 🔧 Integration Examples

### 1. User Registration (in userController.js)
```javascript
const { sendWelcomeEmail } = require('../utils/emailService');

const registerUser = async (req, res) => {
  try {
    // ... user creation logic
    
    // Send welcome email
    await sendWelcomeEmail(newUser);
    
    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    // Handle error
  }
};
```

### 2. Order Confirmation (in orderController.js)
```javascript
const { sendOrderConfirmationEmail } = require('../utils/emailService');

const createOrder = async (req, res) => {
  try {
    // ... order creation logic
    
    // Send order confirmation
    await sendOrderConfirmationEmail(newOrder, user);
    
    res.status(201).json({
      success: true,
      data: newOrder
    });
  } catch (error) {
    // Handle error
  }
};
```

### 3. Password Reset (in authController.js)
```javascript
const { sendPasswordResetEmail } = require('../utils/emailService');

const forgotPassword = async (req, res) => {
  try {
    // ... generate reset token logic
    
    // Send password reset email
    await sendPasswordResetEmail(user, resetToken);
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    // Handle error
  }
};
```

## 🧪 Testing Email Configuration

### Method 1: Using the Test Function
```javascript
const { testEmailConfiguration } = require('./utils/emailService');

// Test email configuration
testEmailConfiguration()
  .then(result => {
    if (result.success) {
      console.log('✅ Email configuration working!');
    } else {
      console.error('❌ Email configuration failed:', result.error);
    }
  });
```

### Method 2: API Endpoint for Testing
Create a test route in your routes:

```javascript
// routes/test.js
const express = require('express');
const { testEmailConfiguration } = require('../utils/emailService');
const router = express.Router();

router.get('/email', async (req, res) => {
  const result = await testEmailConfiguration();
  res.json(result);
});

module.exports = router;
```

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit email credentials to version control
- Use different credentials for development/production
- Store sensitive data in environment variables

### 2. Rate Limiting
- Implement rate limiting for email-sending endpoints
- Use bulk email functions for promotional campaigns
- Respect email provider limits

### 3. Email Validation
- Validate email addresses before sending
- Implement unsubscribe functionality
- Handle bounced emails properly

## 📊 Email Analytics & Monitoring

### 1. Logging
All email functions include console logging:
```javascript
console.log('Order confirmation email sent:', info.messageId);
```

### 2. Database Tracking (Optional Enhancement)
```javascript
// models/EmailLog.js
const emailLogSchema = new mongoose.Schema({
  recipient: String,
  subject: String,
  type: String,
  status: { type: String, enum: ['sent', 'failed'] },
  messageId: String,
  error: String,
  sentAt: { type: Date, default: Date.now }
});
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check email/password credentials
   - Ensure 2FA is enabled and app password is used (Gmail)
   - Verify SMTP settings

2. **"Connection timeout"**
   - Check network connectivity
   - Verify SMTP host and port
   - Check firewall settings

3. **"Emails not being received"**
   - Check spam/junk folders
   - Verify recipient email addresses
   - Check email provider limits

4. **"Rate limit exceeded"**
   - Implement delays between emails
   - Use bulk email functions
   - Consider upgrading email service plan

### Debug Mode:
```javascript
// Add to createTransporter function for debugging
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Enable debug output
  logger: true // Log to console
});
```

## 📈 Production Recommendations

### 1. Email Service Provider
- **SendGrid**: 100 emails/day free, good deliverability
- **Mailgun**: 5,000 emails/month free, developer-friendly
- **AWS SES**: Pay-as-you-go, highly scalable

### 2. Email Templates
- Use responsive email templates
- Test across different email clients
- Include unsubscribe links
- Optimize for mobile devices

### 3. Performance
- Implement email queues for high volume
- Use background jobs for email sending
- Cache email templates
- Monitor delivery rates

## 🎯 Next Steps

1. **Set up your email provider** using the configuration above
2. **Test the email functionality** using the test function
3. **Integrate email functions** into your controllers
4. **Monitor email delivery** and handle errors appropriately
5. **Implement email analytics** for better insights

Your Snappy e-commerce platform now has comprehensive email functionality! 📧✨
