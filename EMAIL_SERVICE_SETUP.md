# 📧 Email Service Production Setup Guide

## 🚀 Professional Email Service Options

### Option 1: SendGrid (Recommended)
**Best for: Most e-commerce applications**

#### Setup Steps:
1. **Create Account**: https://sendgrid.com
2. **Verify Domain**: Add DNS records to verify your domain
3. **Create API Key**: Go to Settings → API Keys
4. **Configure Environment**:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

#### Pricing:
- **Free**: 100 emails/day
- **Essentials**: $14.95/month (40,000 emails)
- **Pro**: $89.95/month (120,000 emails)

### Option 2: AWS SES
**Best for: High volume, technical users**

#### Setup Steps:
1. **AWS Account**: Create AWS account
2. **Verify Domain**: In SES console
3. **Move out of Sandbox**: Request production access
4. **Create SMTP Credentials**: Generate in SES console
5. **Configure Environment**:
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password
```

#### Pricing:
- **$0.10** per 1,000 emails sent
- **$0.12** per 1,000 emails received

### Option 3: Mailgun
**Best for: Developers, API-first approach**

#### Setup Steps:
1. **Create Account**: https://mailgun.com
2. **Add Domain**: Verify with DNS records
3. **Get SMTP Credentials**: From domain settings
4. **Configure Environment**:
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@yourdomain.com
EMAIL_PASS=your_mailgun_password
```

#### Pricing:
- **Free**: 5,000 emails/month (3 months)
- **Foundation**: $35/month (50,000 emails)
- **Growth**: $80/month (100,000 emails)

## 🔧 Configuration for Production

### Environment Variables
```env
# Email Configuration
EMAIL_HOST=smtp.your-service.com
EMAIL_PORT=587
EMAIL_USER=your_username_or_api_key
EMAIL_PASS=your_password_or_api_key

# Optional: Email service specific settings
EMAIL_SECURE=false
EMAIL_TLS=true
EMAIL_FROM_NAME=Snappy Store
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

### Update Email Service (already done in your app)
Your app already uses `utils/emailService.js` which is compatible with any SMTP service.

## 📋 Domain Authentication Setup

### DNS Records (Example for SendGrid)
Add these to your domain's DNS:

```dns
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:sendgrid.net ~all

# DKIM Records
Type: CNAME
Name: s1._domainkey
Value: s1.domainkey.u1234567.wl123.sendgrid.net

Type: CNAME
Name: s2._domainkey
Value: s2.domainkey.u1234567.wl123.sendgrid.net

# Domain Verification
Type: CNAME
Name: em1234567
Value: u1234567.wl123.sendgrid.net
```

## 🧪 Testing Email Setup

### 1. Test Script
Create a test script to verify email configuration:

```javascript
// server/scripts/test-email.js
const { sendOrderConfirmationEmail } = require('../utils/emailService');

async function testEmail() {
  const testOrder = {
    _id: 'test123',
    orderItems: [{ name: 'Test Product', price: 100, quantity: 1 }],
    totalPrice: 100,
    shippingAddress: { fullName: 'Test User', city: 'Test City' }
  };
  
  const testUser = {
    email: 'your-test-email@gmail.com',
    username: 'Test User'
  };
  
  try {
    await sendOrderConfirmationEmail(testOrder, testUser);
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.log('❌ Email failed:', error.message);
  }
}

testEmail();
```

### 2. Run Test
```bash
cd server
node scripts/test-email.js
```

## ⚠️ Important Considerations

### Email Deliverability
- **Domain Authentication**: Always set up SPF, DKIM, and DMARC
- **Warm-up Period**: Start with low volume, gradually increase
- **List Hygiene**: Remove bounced emails promptly
- **Content Quality**: Avoid spam trigger words

### Legal Compliance
- **GDPR**: Include unsubscribe links
- **CAN-SPAM**: Include physical address
- **POPIA** (South Africa): Get consent for marketing emails

### Monitoring
- **Delivery Rates**: Monitor bounce and spam rates
- **Open Rates**: Track engagement
- **Complaint Rates**: Keep below 0.1%
- **Unsubscribe Rates**: Monitor for content issues

## 📊 Email Templates Already Implemented

Your app includes these email templates:
- ✅ Order confirmation
- ✅ Order status updates
- ✅ Shipping notifications
- ✅ Password reset
- ✅ Low stock alerts

## 🚀 Next Steps

1. **Choose Email Service**: SendGrid recommended for most users
2. **Set up Account**: Complete verification process
3. **Configure DNS**: Add required DNS records
4. **Update Environment**: Set EMAIL_* variables
5. **Test Thoroughly**: Send test emails
6. **Monitor Performance**: Track delivery metrics

## 📞 Support Resources

- **SendGrid Docs**: https://docs.sendgrid.com
- **AWS SES Docs**: https://docs.aws.amazon.com/ses
- **Mailgun Docs**: https://documentation.mailgun.com
- **Email Authentication**: https://mxtoolbox.com

---

**🎉 Professional email service will improve deliverability and customer trust!**
