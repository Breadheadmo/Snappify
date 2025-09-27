# 💳 Paystack Production Setup Guide

## 🚀 Getting Live Paystack Keys

### Step 1: Account Verification
Before you can use live keys, your Paystack account must be verified:

1. **Complete Business Verification**
   - Go to Settings → Business Details
   - Upload required documents:
     - Certificate of Incorporation (for companies)
     - Valid ID of business owner
     - Bank verification letter
   - Wait for approval (usually 1-3 business days)

2. **Bank Account Verification**
   - Go to Settings → Settlement Account
   - Add and verify your business bank account
   - Confirm micro-deposits if required

### Step 2: Activate Live Mode
Once verified:

1. **Switch to Live Mode**
   - In your Paystack dashboard, toggle from "Test" to "Live"
   - You'll see a different dashboard with live transaction data

2. **Generate Live Keys**
   - Go to Settings → API Keys & Webhooks
   - Copy your Live Public Key (pk_live_...)
   - Copy your Live Secret Key (sk_live_...)

### Step 3: Configure Webhooks
Set up webhooks for production:

1. **Create Webhook Endpoint**
   - URL: `https://yourdomain.com/api/payments/webhook`
   - Events to subscribe to:
     - `charge.success`
     - `charge.failed` 
     - `transfer.success`
     - `transfer.failed`

2. **Get Webhook Secret**
   - Copy the webhook secret for verification
   - Update `PAYSTACK_WEBHOOK_SECRET` in your .env

### Step 4: Update Environment Variables

```env
# Live Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_your_actual_live_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_actual_live_key_here
PAYSTACK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

### Step 5: Test Live Integration

1. **Small Test Transaction**
   - Process a small amount (e.g., R1.00)
   - Use a real card (not test cards)
   - Verify the transaction appears in your live dashboard

2. **Webhook Testing**
   - Complete a test transaction
   - Check your server logs for webhook events
   - Verify order status updates correctly

## ⚠️ Important Production Considerations

### Transaction Fees
- **Local Cards**: 1.5% + R1.00
- **International Cards**: 3.9% + R1.00  
- **Bank Transfer**: R10.00 flat fee
- **USSD**: R50.00 flat fee

### Settlement
- **Local transactions**: T+1 settlement
- **International transactions**: T+3 settlement
- **Minimum settlement**: R100.00

### Security Requirements
- ✅ SSL certificate mandatory for live mode
- ✅ Domain verification required
- ✅ Webhook signature verification
- ✅ PCI compliance for card data

### Rate Limits
- **Live API**: 100 requests per second
- **Higher limits**: Contact Paystack support

## 🔧 Code Changes for Production

### Client-side (.env.production)
```env
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
```

### Server-side (.env)
```env
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 🧪 Testing Checklist

- [ ] Account fully verified
- [ ] Live keys configured
- [ ] Webhook endpoint responding
- [ ] SSL certificate active
- [ ] Small test transaction successful
- [ ] Webhook events received
- [ ] Order status updates working
- [ ] Email notifications sending
- [ ] Settlement account configured

## 📞 Support Resources

- **Paystack Documentation**: https://paystack.com/docs
- **Support Email**: support@paystack.com
- **Developer Community**: Paystack Slack
- **API Status**: https://status.paystack.com

## 🚨 Security Reminders

- **NEVER** expose secret keys in client code
- **ALWAYS** verify webhook signatures
- **NEVER** trust transaction data from client-side only
- **ALWAYS** verify transactions server-side
- **USE** HTTPS for all live transactions

---

**🎉 Once completed, your payment system will be ready for real transactions!**
