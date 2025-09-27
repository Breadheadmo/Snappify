const nodemailer = require('nodemailer');
const {
  getWelcomeEmailTemplate,
  getEmailVerificationTemplate,
  getNewsletterSubscriptionTemplate,
  getOrderCancellationTemplate,
  getWishlistReminderTemplate,
  getSecurityAlertTemplate
} = require('./emailTemplates');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const transporter = createTransporter();

    const orderItems = order.orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R${item.price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Snappy</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Snappy</h1>
            <h2 style="color: #2563eb; margin: 10px 0;">Order Confirmation</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-top: 0;">Hi ${user.username || user.firstName || 'Valued Customer'},</h3>
            <p>Thank you for your order! We've received your order and it's being processed.</p>
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 15px 10px; text-align: left; border-bottom: 2px solid #eee;">Image</th>
                  <th style="padding: 15px 10px; text-align: left; border-bottom: 2px solid #eee;">Product</th>
                  <th style="padding: 15px 10px; text-align: center; border-bottom: 2px solid #eee;">Qty</th>
                  <th style="padding: 15px 10px; text-align: right; border-bottom: 2px solid #eee;">Price</th>
                  <th style="padding: 15px 10px; text-align: right; border-bottom: 2px solid #eee;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems}
              </tbody>
            </table>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Subtotal:</span>
              <span>R${order.subtotal?.toLocaleString() || (order.totalPrice - (order.shippingPrice || 0) - (order.taxPrice || 0)).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Shipping:</span>
              <span>R${order.shippingPrice?.toLocaleString() || '0'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Tax:</span>
              <span>R${order.taxPrice?.toLocaleString() || '0'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 2px solid #eee; padding-top: 10px;">
              <span>Total:</span>
              <span>R${order.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333;">Shipping Address</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
              <p style="margin: 0;">${order.shippingAddress.fullName}</p>
              <p style="margin: 5px 0;">${order.shippingAddress.addressLine1}</p>
              ${order.shippingAddress.addressLine2 ? `<p style="margin: 5px 0;">${order.shippingAddress.addressLine2}</p>` : ''}
              <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
              <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
              ${order.shippingAddress.phoneNumber ? `<p style="margin: 5px 0;">Phone: ${order.shippingAddress.phoneNumber}</p>` : ''}
            </div>
          </div>

          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1976d2; margin-top: 0;">What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>We'll send you a shipping confirmation email when your order ships</li>
              <li>You can track your order status in your account</li>
              <li>Estimated delivery: 3-5 business days</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 10px 0;">Thank you for shopping with Snappy!</p>
            <p style="color: #666; margin: 10px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #2563eb; text-decoration: none;">Visit our store</a> | 
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" style="color: #2563eb; text-decoration: none;">Track your order</a>
            </p>
            <p style="color: #999; font-size: 12px; margin: 20px 0 0;">
              If you have any questions, contact us at ${process.env.SUPPORT_EMAIL || 'support@snappy.co.za'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Snappy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation #${order._id} - Snappy`,
      html: emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

/**
 * Send order status update email
 */
const sendOrderStatusEmail = async (order, user, oldStatus, newStatus) => {
  try {
    const transporter = createTransporter();

    const statusMessages = {
      pending: 'Your order has been received and is pending processing.',
      processing: 'Great news! Your order is now being processed.',
      shipped: 'Your order has been shipped and is on its way!',
      delivered: 'Your order has been delivered. Thank you for shopping with us!',
      cancelled: 'Your order has been cancelled. If you have any questions, please contact support.'
    };

    const statusColors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Update - Snappy</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Snappy</h1>
            <h2 style="color: #2563eb; margin: 10px 0;">Order Status Update</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-top: 0;">Hi ${user.username || user.firstName || 'Valued Customer'},</h3>
            <p>Your order status has been updated!</p>
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          <div style="background-color: ${statusColors[newStatus]}; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h3 style="margin: 0; text-transform: uppercase;">${newStatus}</h3>
            <p style="margin: 10px 0 0;">${statusMessages[newStatus]}</p>
          </div>

          ${newStatus === 'shipped' ? `
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="color: #1976d2; margin-top: 0;">Tracking Information</h3>
              <p>Your order is on its way! You can track your package using the tracking number below:</p>
              <p style="font-weight: bold; font-size: 18px;">${order.trackingNumber || 'Tracking number will be provided shortly'}</p>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 10px 0;">Thank you for shopping with Snappy!</p>
            <p style="color: #666; margin: 10px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" style="color: #2563eb; text-decoration: none;">View Order Details</a>
            </p>
            <p style="color: #999; font-size: 12px; margin: 20px 0 0;">
              If you have any questions, contact us at ${process.env.SUPPORT_EMAIL || 'support@snappy.co.za'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Snappy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Update: ${newStatus.toUpperCase()} - Order #${order._id}`,
      html: emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order status email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order status email:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Snappy</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Snappy</h1>
            <h2 style="color: #2563eb; margin: 10px 0;">Password Reset Request</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-top: 0;">Hi ${user.username || user.firstName || 'User'},</h3>
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Reset Your Password
            </a>
          </div>

          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="color: #dc2626; margin: 0; font-weight: bold;">Security Notice:</p>
            <ul style="color: #dc2626; margin: 10px 0 0; padding-left: 20px;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please contact support</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 10px 0;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #2563eb; word-break: break-all; margin: 10px 0;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px; margin: 20px 0 0;">
              If you have any questions, contact us at ${process.env.SUPPORT_EMAIL || 'support@snappy.co.za'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Snappy Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset Your Password - Snappy',
      html: emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

/**
 * Send low stock alert to admin
 */
const sendLowStockAlert = async (products) => {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const productRows = products.map(product => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${product.countInStock}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.category}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">R${product.price.toLocaleString()}</td>
      </tr>
    `).join('');

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Low Stock Alert - Snappy Admin</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Snappy Admin</h1>
            <h2 style="color: #dc2626; margin: 10px 0;">⚠️ Low Stock Alert</h2>
          </div>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="color: #dc2626; margin: 0; font-weight: bold;">The following products are running low on stock:</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 15px 10px; text-align: left; border-bottom: 2px solid #eee;">Product</th>
                <th style="padding: 15px 10px; text-align: center; border-bottom: 2px solid #eee;">Stock</th>
                <th style="padding: 15px 10px; text-align: left; border-bottom: 2px solid #eee;">Category</th>
                <th style="padding: 15px 10px; text-align: left; border-bottom: 2px solid #eee;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/products" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Manage Inventory
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated alert from your Snappy inventory management system.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Snappy System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `⚠️ Low Stock Alert - ${products.length} Product${products.length !== 1 ? 's' : ''} Need Attention`,
      html: emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Low stock alert email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending low stock alert email:', error);
    return false;
  }
};

/**
 * Send order tracking update email
 */
const sendOrderTrackingEmail = async (order, user, trackingInfo) => {
  try {
    const transporter = createTransporter();

    // Tracking stages with icons
    const trackingStages = [
      { stage: 'confirmed', label: 'Order Confirmed', icon: '✅' },
      { stage: 'processing', label: 'Processing', icon: '📦' },
      { stage: 'shipped', label: 'Shipped', icon: '🚚' },
      { stage: 'out_for_delivery', label: 'Out for Delivery', icon: '🏃‍♂️' },
      { stage: 'delivered', label: 'Delivered', icon: '🎉' }
    ];

    const currentStageIndex = trackingStages.findIndex(s => s.stage === trackingInfo.currentStage);
    
    const trackingProgress = trackingStages.map((stage, index) => {
      const isCompleted = index <= currentStageIndex;
      const isCurrent = index === currentStageIndex;
      
      return `
        <div style="display: flex; align-items: center; margin: 15px 0; ${isCurrent ? 'font-weight: bold; color: #2563eb;' : isCompleted ? 'color: #10b981;' : 'color: #9ca3af;'}">
          <div style="width: 30px; height: 30px; border-radius: 50%; ${isCompleted ? 'background-color: #10b981;' : 'background-color: #e5e7eb;'} display: flex; align-items: center; justify-content: center; margin-right: 15px;">
            ${isCompleted ? '✓' : stage.icon}
          </div>
          <span>${stage.label}</span>
          ${isCurrent && trackingInfo.estimatedDelivery ? `<span style="margin-left: 10px; font-size: 12px; color: #6b7280;">(Est. ${new Date(trackingInfo.estimatedDelivery).toLocaleDateString()})</span>` : ''}
        </div>
      `;
    }).join('');

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Tracking Update - Snappy</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Snappy</h1>
            <h2 style="color: #2563eb; margin: 10px 0;">📦 Order Tracking Update</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-top: 0;">Hi ${user.username || user.firstName || 'Valued Customer'},</h3>
            <p>Your order is on the move! Here's the latest update on your package.</p>
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
            ${trackingInfo.carrier ? `<p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>` : ''}
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333;">Tracking Progress</h3>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              ${trackingProgress}
            </div>
          </div>

          ${trackingInfo.currentStage === 'shipped' ? `
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="color: #1976d2; margin-top: 0;">📍 Track Your Package</h3>
              <p>You can track your package in real-time using the tracking number above.</p>
              ${trackingInfo.trackingUrl ? `
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${trackingInfo.trackingUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                    Track Package
                  </a>
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${trackingInfo.currentStage === 'delivered' ? `
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="color: #15803d; margin-top: 0;">🎉 Package Delivered!</h3>
              <p>Your order has been successfully delivered!</p>
              <p><strong>Delivered at:</strong> ${new Date(trackingInfo.deliveredAt).toLocaleString()}</p>
              ${trackingInfo.deliveredTo ? `<p><strong>Delivered to:</strong> ${trackingInfo.deliveredTo}</p>` : ''}
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/rate-order/${order._id}" style="background-color: #15803d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Rate Your Experience
                </a>
              </div>
            </div>
          ` : ''}

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333;">Order Summary</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
              <p><strong>Total:</strong> R${order.totalPrice.toLocaleString()}</p>
              <p><strong>Items:</strong> ${order.orderItems.length} item(s)</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 10px 0;">Questions about your order?</p>
            <p style="color: #666; margin: 10px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" style="color: #2563eb; text-decoration: none;">Contact Support</a> | 
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/orders" style="color: #2563eb; text-decoration: none;">View Order Details</a>
            </p>
            <p style="color: #999; font-size: 12px; margin: 20px 0 0;">
              This tracking update was sent automatically. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Snappy Shipping" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `📦 Tracking Update: Your order is ${trackingInfo.currentStage} - Order #${order._id}`,
      html: emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order tracking email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order tracking email:', error);
    return false;
  }
};

/**
 * Send shipping confirmation email
 */
const sendShippingConfirmationEmail = async (order, user, shippingDetails) => {
  try {
    const transporter = createTransporter();

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Order Has Shipped - Snappy</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Snappy</h1>
            <h2 style="color: #2563eb; margin: 10px 0;">🚚 Your Order Has Shipped!</h2>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1976d2; margin-top: 0;">Great news, ${user.username || user.firstName || 'Valued Customer'}!</h3>
            <p>Your order is on its way to you. Here are the shipping details:</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-top: 0;">Shipping Information</h3>
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Tracking Number:</strong> ${shippingDetails.trackingNumber}</p>
            <p><strong>Carrier:</strong> ${shippingDetails.carrier || 'Standard Delivery'}</p>
            <p><strong>Estimated Delivery:</strong> ${new Date(shippingDetails.estimatedDelivery).toLocaleDateString()}</p>
            <p><strong>Shipping Method:</strong> ${shippingDetails.method || order.shippingMethod?.name || 'Standard'}</p>
          </div>

          ${shippingDetails.trackingUrl ? `
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${shippingDetails.trackingUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Track Your Package
              </a>
            </div>
          ` : ''}

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-top: 0;">Delivery Address</h3>
            <p style="margin: 0;">${order.shippingAddress.fullName}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.addressLine1}</p>
            ${order.shippingAddress.addressLine2 ? `<p style="margin: 5px 0;">${order.shippingAddress.addressLine2}</p>` : ''}
            <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
          </div>

          <div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #ea580c; margin-top: 0;">📱 Stay Updated</h3>
            <p>We'll send you tracking updates as your package makes its way to you. You can also track your order anytime in your account.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 10px 0;">Thank you for shopping with Snappy!</p>
            <p style="color: #666; margin: 10px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/orders" style="color: #2563eb; text-decoration: none;">View Order Details</a> | 
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" style="color: #2563eb; text-decoration: none;">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Snappy Shipping" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🚚 Your order is on the way! - Order #${order._id}`,
      html: emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Shipping confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending shipping confirmation email:', error);
    return false;
  }
};

/**
 * Send welcome email to new users
 */
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Snappy Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎉 Welcome to Snappy - Your Tech Shopping Journey Begins!',
      html: getWelcomeEmailTemplate(user)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

/**
 * Send email verification
 */
const sendEmailVerification = async (user, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Snappy Verification" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '📧 Verify Your Email Address - Snappy',
      html: getEmailVerificationTemplate(user, verificationToken)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email verification sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email verification:', error);
    return false;
  }
};

/**
 * Send newsletter subscription confirmation
 */
const sendNewsletterConfirmation = async (email) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Snappy Newsletter" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '📰 Newsletter Subscription Confirmed - Snappy',
      html: getNewsletterSubscriptionTemplate(email)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Newsletter confirmation sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending newsletter confirmation:', error);
    return false;
  }
};

/**
 * Send order cancellation email
 */
const sendOrderCancellationEmail = async (order, user, reason) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Snappy Orders" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Cancelled - Order #${order._id} - Snappy`,
      html: getOrderCancellationTemplate(order, user, reason)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order cancellation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order cancellation email:', error);
    return false;
  }
};

/**
 * Send wishlist reminder email
 */
const sendWishlistReminder = async (user, wishlistItems) => {
  try {
    if (!wishlistItems || wishlistItems.length === 0) {
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Snappy Wishlist" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `💖 ${wishlistItems.length} Item${wishlistItems.length !== 1 ? 's' : ''} Waiting in Your Wishlist - Snappy`,
      html: getWishlistReminderTemplate(user, wishlistItems)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Wishlist reminder email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending wishlist reminder email:', error);
    return false;
  }
};

/**
 * Send security alert email
 */
const sendSecurityAlert = async (user, alertType, details) => {
  try {
    const transporter = createTransporter();
    
    const subjects = {
      login: '🔐 New Login Detected - Snappy',
      password_change: '✅ Password Changed Successfully - Snappy',
      email_change: '📧 Email Address Updated - Snappy',
      suspicious_activity: '⚠️ Security Alert - Snappy'
    };
    
    const mailOptions = {
      from: `"Snappy Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: subjects[alertType] || '🔒 Security Alert - Snappy',
      html: getSecurityAlertTemplate(user, alertType, details)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Security alert email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending security alert email:', error);
    return false;
  }
};

/**
 * Send order delivery notification
 */
const sendDeliveryNotification = async (order, user) => {
  try {
    const transporter = createTransporter();

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Package Delivered - Snappy</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Snappy</h1>
            <h2 style="color: #10b981; margin: 10px 0;">🎉 Package Delivered!</h2>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #15803d; margin-top: 0;">Great news, ${user.firstName || user.username || 'Valued Customer'}!</h3>
            <p style="color: #15803d;">Your order has been successfully delivered!</p>
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Delivered on:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/rate-order/${order._id}" style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Rate Your Experience
            </a>
          </div>

          <div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #ea580c; margin-top: 0;">📝 How Was Your Experience?</h3>
            <p style="color: #ea580c;">We'd love to hear about your shopping experience! Your feedback helps us improve our service.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 10px 0;">Thank you for choosing Snappy!</p>
            <p style="color: #666; margin: 10px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #2563eb; text-decoration: none;">Shop Again</a> | 
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" style="color: #2563eb; text-decoration: none;">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Snappy Delivery" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🎉 Package Delivered - Order #${order._id} - Snappy`,
      html: emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Delivery notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending delivery notification email:', error);
    return false;
  }
};

/**
 * Send bulk promotional email
 */
const sendPromotionalEmail = async (recipients, subject, content) => {
  try {
    const transporter = createTransporter();
    const results = [];

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          const mailOptions = {
            from: `"Snappy Promotions" <${process.env.EMAIL_USER}>`,
            to: recipient.email,
            subject: subject,
            html: content.replace('{{name}}', recipient.name || 'Valued Customer')
          };

          const info = await transporter.sendMail(mailOptions);
          return { email: recipient.email, success: true, messageId: info.messageId };
        } catch (error) {
          console.error(`Error sending promotional email to ${recipient.email}:`, error);
          return { email: recipient.email, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Wait between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Promotional email campaign completed: ${successful} sent, ${failed} failed`);
    return { successful, failed, results };
  } catch (error) {
    console.error('Error sending promotional emails:', error);
    return { successful: 0, failed: recipients.length, error: error.message };
  }
};

/**
 * Test email configuration
 */
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    
    // Send test email
    const testEmail = {
      from: `"Snappy Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: '✅ Snappy Email Configuration Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify that Nodemailer is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
        <p>If you receive this email, your email configuration is working! 🎉</p>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email configuration test failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendPasswordResetEmail,
  sendLowStockAlert,
  sendOrderTrackingEmail,
  sendShippingConfirmationEmail,
  sendWelcomeEmail,
  sendEmailVerification,
  sendNewsletterConfirmation,
  sendOrderCancellationEmail,
  sendWishlistReminder,
  sendSecurityAlert,
  sendDeliveryNotification,
  sendPromotionalEmail,
  testEmailConfiguration
};
