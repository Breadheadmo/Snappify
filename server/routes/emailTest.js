const express = require('express');
const router = express.Router();
const {
  testEmailConfiguration,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendNewsletterConfirmation
} = require('../utils/emailService');

// Test email configuration
router.get('/config', async (req, res) => {
  try {
    const result = await testEmailConfiguration();
    res.json({
      success: result.success,
      message: result.success ? 'Email configuration working!' : 'Email configuration failed',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing email configuration',
      error: error.message
    });
  }
});

// Test welcome email
router.post('/welcome', async (req, res) => {
  try {
    const { email, firstName, username } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const mockUser = {
      email,
      firstName: firstName || 'Test',
      username: username || 'testuser'
    };

    const result = await sendWelcomeEmail(mockUser);
    
    res.json({
      success: result,
      message: result ? 'Welcome email sent successfully!' : 'Failed to send welcome email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending welcome email',
      error: error.message
    });
  }
});

// Test order confirmation email
router.post('/order-confirmation', async (req, res) => {
  try {
    const { email, orderId } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const mockUser = {
      email,
      firstName: 'Test',
      username: 'testuser'
    };

    const mockOrder = {
      _id: orderId || '6507f123456789abcdef0123',
      orderItems: [
        {
          name: 'Test Product',
          price: 299,
          quantity: 1,
          image: 'https://via.placeholder.com/100x100?text=Product'
        },
        {
          name: 'Another Product',
          price: 599,
          quantity: 2,
          image: 'https://via.placeholder.com/100x100?text=Product2'
        }
      ],
      totalPrice: 1497,
      subtotal: 1497,
      shippingPrice: 0,
      taxPrice: 0,
      shippingAddress: {
        fullName: 'Test User',
        addressLine1: '123 Test Street',
        addressLine2: 'Apt 4B',
        city: 'Cape Town',
        postalCode: '8001',
        country: 'South Africa',
        phoneNumber: '+27 12 345 6789'
      },
      createdAt: new Date()
    };

    const result = await sendOrderConfirmationEmail(mockOrder, mockUser);
    
    res.json({
      success: result,
      message: result ? 'Order confirmation email sent successfully!' : 'Failed to send order confirmation email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending order confirmation email',
      error: error.message
    });
  }
});

// Test password reset email
router.post('/password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const mockUser = {
      email,
      firstName: 'Test',
      username: 'testuser'
    };

    const mockResetToken = 'test-reset-token-12345';

    const result = await sendPasswordResetEmail(mockUser, mockResetToken);
    
    res.json({
      success: result,
      message: result ? 'Password reset email sent successfully!' : 'Failed to send password reset email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending password reset email',
      error: error.message
    });
  }
});

// Test newsletter confirmation email
router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await sendNewsletterConfirmation(email);
    
    res.json({
      success: result,
      message: result ? 'Newsletter confirmation email sent successfully!' : 'Failed to send newsletter confirmation email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending newsletter confirmation email',
      error: error.message
    });
  }
});

// Get email service status
router.get('/status', (req, res) => {
  const emailConfig = {
    host: process.env.EMAIL_HOST || 'Not configured',
    port: process.env.EMAIL_PORT || 'Not configured',
    user: process.env.EMAIL_USER ? 'Configured' : 'Not configured',
    password: process.env.EMAIL_PASS ? 'Configured' : 'Not configured',
    supportEmail: process.env.SUPPORT_EMAIL || 'Not configured',
    adminEmail: process.env.ADMIN_EMAIL || 'Not configured'
  };

  res.json({
    success: true,
    message: 'Email service status',
    config: emailConfig,
    availableTests: [
      'GET /api/email-test/config - Test email configuration',
      'POST /api/email-test/welcome - Test welcome email',
      'POST /api/email-test/order-confirmation - Test order confirmation email',
      'POST /api/email-test/password-reset - Test password reset email',
      'POST /api/email-test/newsletter - Test newsletter confirmation email'
    ]
  });
});

module.exports = router;
