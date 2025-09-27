/**
 * Email Templates for Snappy E-commerce
 * =====================================
 * 
 * Comprehensive email templates for all email use cases
 */

/**
 * Welcome email template for new user registration
 */
const getWelcomeEmailTemplate = (user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Snappy!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 2.5em;">🛍️ Snappy</h1>
          <h2 style="color: #333; margin: 10px 0;">Welcome to the family!</h2>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #1976d2; margin-top: 0;">Hi ${user.firstName || user.username || 'New Customer'}! 👋</h3>
          <p>Welcome to Snappy! We're thrilled to have you join our community of tech enthusiasts.</p>
          <p>Your account has been successfully created with the email: <strong>${user.email}</strong></p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333;">🚀 What's Next?</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin: 10px 0;">Browse our latest tech products and accessories</li>
              <li style="margin: 10px 0;">Complete your profile for a personalized experience</li>
              <li style="margin: 10px 0;">Add items to your wishlist for later</li>
              <li style="margin: 10px 0;">Enjoy fast, secure checkout with multiple payment options</li>
            </ul>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Start Shopping
          </a>
        </div>

        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #0369a1; margin-top: 0;">💡 Pro Tips:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #0369a1;">
            <li style="margin: 8px 0;">Follow us on social media for exclusive deals</li>
            <li style="margin: 8px 0;">Sign up for our newsletter to get first access to new products</li>
            <li style="margin: 8px 0;">Refer friends and earn rewards</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 10px 0;">Need help getting started?</p>
          <p style="color: #666; margin: 10px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/help" style="color: #2563eb; text-decoration: none;">Visit Help Center</a> | 
            <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@snappy.co.za'}" style="color: #2563eb; text-decoration: none;">Contact Support</a>
          </p>
          <p style="color: #999; font-size: 12px; margin: 20px 0 0;">
            Welcome aboard! - The Snappy Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email verification template
 */
const getEmailVerificationTemplate = (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - Snappy</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Snappy</h1>
          <h2 style="color: #333; margin: 10px 0;">📧 Verify Your Email</h2>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #333; margin-top: 0;">Hi ${user.firstName || user.username || 'User'},</h3>
          <p>Thank you for signing up with Snappy! To complete your registration and start shopping, please verify your email address.</p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Verify Email Address
          </a>
        </div>

        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #dc2626; margin: 0; font-weight: bold;">⏰ Important:</p>
          <ul style="color: #dc2626; margin: 10px 0 0; padding-left: 20px;">
            <li>This verification link will expire in 24 hours</li>
            <li>If you didn't create this account, please ignore this email</li>
            <li>For security, never share this link with anyone</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 10px 0;">
            If the button doesn't work, copy and paste this link:
          </p>
          <p style="color: #2563eb; word-break: break-all; margin: 10px 0; font-size: 12px;">${verificationUrl}</p>
          <p style="color: #999; font-size: 12px; margin: 20px 0 0;">
            Need help? Contact us at ${process.env.SUPPORT_EMAIL || 'support@snappy.co.za'}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Newsletter subscription confirmation template
 */
const getNewsletterSubscriptionTemplate = (email) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Newsletter Subscription - Snappy</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Snappy</h1>
          <h2 style="color: #333; margin: 10px 0;">📰 Newsletter Subscription Confirmed!</h2>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #0369a1; margin-top: 0;">🎉 Welcome to our newsletter!</h3>
          <p>Thank you for subscribing to the Snappy newsletter with the email: <strong>${email}</strong></p>
          <p>You'll now be the first to know about:</p>
        </div>

        <div style="margin-bottom: 30px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin: 10px 0;">🆕 New product launches and tech releases</li>
              <li style="margin: 10px 0;">💰 Exclusive discounts and special offers</li>
              <li style="margin: 10px 0;">📦 Early access to sales and promotions</li>
              <li style="margin: 10px 0;">🔧 Tech tips and product guides</li>
              <li style="margin: 10px 0;">🎁 Subscriber-only giveaways and contests</li>
            </ul>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Start Shopping
          </a>
        </div>

        <div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #ea580c; margin: 0; font-weight: bold;">📱 Stay Connected:</p>
          <p style="color: #ea580c; margin: 10px 0;">Follow us on social media for daily updates and behind-the-scenes content!</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 10px 0;">
            You can unsubscribe anytime by <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe" style="color: #2563eb; text-decoration: none;">clicking here</a>
          </p>
          <p style="color: #999; font-size: 12px; margin: 20px 0 0;">
            Thank you for joining our community! - The Snappy Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Order cancellation email template
 */
const getOrderCancellationTemplate = (order, user, reason) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Cancelled - Snappy</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Snappy</h1>
          <h2 style="color: #dc2626; margin: 10px 0;">Order Cancelled</h2>
        </div>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #dc2626; margin-top: 0;">Hi ${user.username || user.firstName || 'Valued Customer'},</h3>
          <p>We're sorry to inform you that your order has been cancelled.</p>
          <p><strong>Order ID:</strong> #${order._id}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333;">Refund Information</h3>
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px;">
            <p style="color: #0369a1; margin: 0;"><strong>💳 Refund Process:</strong></p>
            <ul style="color: #0369a1; margin: 10px 0 0; padding-left: 20px;">
              <li>Your refund of <strong>R${order.totalPrice.toLocaleString()}</strong> will be processed within 3-5 business days</li>
              <li>The refund will be credited to your original payment method</li>
              <li>You'll receive a confirmation email once the refund is processed</li>
            </ul>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333;">Order Summary</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
            <p><strong>Total Amount:</strong> R${order.totalPrice.toLocaleString()}</p>
            <p><strong>Items:</strong> ${order.orderItems.length} item(s)</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Card'}</p>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Continue Shopping
          </a>
        </div>

        <div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #ea580c; margin-top: 0;">We're Here to Help</h3>
          <p style="color: #ea580c; margin: 0;">If you have any questions about this cancellation or need assistance with a new order, our support team is ready to help!</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 10px 0;">
            <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@snappy.co.za'}" style="color: #2563eb; text-decoration: none;">Contact Support</a> | 
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/help" style="color: #2563eb; text-decoration: none;">Help Center</a>
          </p>
          <p style="color: #999; font-size: 12px; margin: 20px 0 0;">
            We appreciate your understanding - The Snappy Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Wishlist reminder email template
 */
const getWishlistReminderTemplate = (user, wishlistItems) => {
  const itemsHtml = wishlistItems.slice(0, 3).map(item => `
    <div style="display: flex; align-items: center; margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
      <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
      <div style="flex: 1;">
        <h4 style="margin: 0 0 5px; color: #333;">${item.name}</h4>
        <p style="margin: 0; color: #666; font-size: 14px;">R${item.price.toLocaleString()}</p>
        ${item.salePrice ? `<p style="margin: 5px 0 0; color: #dc2626; font-weight: bold;">Sale: R${item.salePrice.toLocaleString()}</p>` : ''}
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Items in Your Wishlist - Snappy</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Snappy</h1>
          <h2 style="color: #333; margin: 10px 0;">💖 Don't Forget Your Wishlist!</h2>
        </div>
        
        <div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #ea580c; margin-top: 0;">Hi ${user.firstName || user.username || 'Tech Enthusiast'}! 👋</h3>
          <p>You have ${wishlistItems.length} amazing item${wishlistItems.length !== 1 ? 's' : ''} waiting for you in your wishlist!</p>
          <p>Don't let these great products slip away - some might be running low on stock or going on sale soon.</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333;">Your Wishlist Items:</h3>
          ${itemsHtml}
          ${wishlistItems.length > 3 ? `
            <div style="text-align: center; margin: 20px 0;">
              <p style="color: #666;">And ${wishlistItems.length - 3} more item${wishlistItems.length - 3 !== 1 ? 's' : ''} waiting for you!</p>
            </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/wishlist" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            View My Wishlist
          </a>
        </div>

        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #0369a1; margin-top: 0;">⚡ Limited Time Offers</h3>
          <ul style="color: #0369a1; margin: 0; padding-left: 20px;">
            <li style="margin: 8px 0;">Free shipping on orders over R500</li>
            <li style="margin: 8px 0;">30-day return policy on all items</li>
            <li style="margin: 8px 0;">Price match guarantee</li>
            <li style="margin: 8px 0;">Exclusive member discounts available</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 10px 0;">
            Not interested in these emails? <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe" style="color: #2563eb; text-decoration: none;">Unsubscribe</a>
          </p>
          <p style="color: #999; font-size: 12px; margin: 20px 0 0;">
            Happy shopping! - The Snappy Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Account security alert template
 */
const getSecurityAlertTemplate = (user, alertType, details) => {
  const alertMessages = {
    login: 'A new login was detected on your account',
    password_change: 'Your password has been changed',
    email_change: 'Your email address has been updated',
    suspicious_activity: 'Suspicious activity detected on your account'
  };

  const alertColors = {
    login: '#f59e0b',
    password_change: '#10b981',
    email_change: '#3b82f6',
    suspicious_activity: '#dc2626'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Security Alert - Snappy</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Snappy</h1>
          <h2 style="color: ${alertColors[alertType]}; margin: 10px 0;">🔒 Security Alert</h2>
        </div>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #dc2626; margin-top: 0;">Hi ${user.firstName || user.username || 'User'},</h3>
          <p style="color: #dc2626; font-weight: bold;">${alertMessages[alertType]}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #333; margin-top: 0;">Activity Details:</h3>
          <p><strong>Date & Time:</strong> ${new Date(details.timestamp).toLocaleString()}</p>
          <p><strong>IP Address:</strong> ${details.ipAddress || 'Unknown'}</p>
          <p><strong>Location:</strong> ${details.location || 'Unknown'}</p>
          <p><strong>Device:</strong> ${details.userAgent || 'Unknown'}</p>
        </div>

        ${alertType === 'login' ? `
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #0369a1; margin-top: 0;">Was this you?</h3>
            <p style="color: #0369a1;">If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.</p>
          </div>
        ` : ''}

        ${alertType === 'suspicious_activity' ? `
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #dc2626; margin-top: 0;">⚠️ Immediate Action Required</h3>
            <p style="color: #dc2626;">We've detected unusual activity on your account. Please review your account settings and change your password immediately.</p>
          </div>
        ` : ''}

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/security" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Review Account Security
          </a>
        </div>

        <div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #ea580c; margin-top: 0;">🛡️ Security Tips:</h3>
          <ul style="color: #ea580c; margin: 0; padding-left: 20px;">
            <li style="margin: 8px 0;">Use a strong, unique password</li>
            <li style="margin: 8px 0;">Enable two-factor authentication</li>
            <li style="margin: 8px 0;">Log out from public computers</li>
            <li style="margin: 8px 0;">Regularly review your account activity</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 10px 0;">
            If you need help securing your account, <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@snappy.co.za'}" style="color: #2563eb; text-decoration: none;">contact our support team</a>
          </p>
          <p style="color: #999; font-size: 12px; margin: 20px 0 0;">
            Your security is our priority - The Snappy Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getWelcomeEmailTemplate,
  getEmailVerificationTemplate,
  getNewsletterSubscriptionTemplate,
  getOrderCancellationTemplate,
  getWishlistReminderTemplate,
  getSecurityAlertTemplate
};
