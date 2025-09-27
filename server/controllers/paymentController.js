const asyncHandler = require('../middleware/asyncHandler');
const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const paystackService = require('../config/paystack');
const crypto = require('crypto');

/**
 * @desc    Initialize payment transaction
 * @route   POST /api/payments/initialize
 * @access  Private
 */
const initializePayment = asyncHandler(async (req, res) => {
  const { orderId, email, firstName, lastName, phone } = req.body;

  console.log('=== PAYMENT INITIALIZATION STARTED ===');
  console.log('Request body:', req.body);
  console.log('User ID:', req.user._id);
  console.log('Order ID:', orderId);
  console.log('Client IP:', req.ip);

  // Validate required fields
  if (!orderId) {
    console.log('ERROR: Order ID is missing');
    res.status(400);
    throw new Error('Order ID is required');
  }

  // Find the order
  console.log('Searching for order...');
  const order = await Order.findById(orderId).populate('user', 'username email firstName lastName phone');

  if (!order) {
    console.log('ERROR: Order not found with ID:', orderId);
    res.status(404);
    throw new Error('Order not found');
  }

  console.log('Order found:', {
    id: order._id,
    userId: order.user._id.toString(),
    total: order.totalPrice,
    isPaid: order.isPaid,
    status: order.orderStatus
  });

  // Check if user owns the order

  // Check if user owns the order
  if (order.user._id.toString() !== req.user._id.toString()) {
    console.log('ERROR: User not authorized. Order user:', order.user._id.toString(), 'Auth user:', req.user._id.toString());
    res.status(403);
    throw new Error('Not authorized to pay for this order');
  }

  // Check if order is already paid
  if (order.isPaid) {
    console.log('ERROR: Order is already paid');
    res.status(400);
    throw new Error('Order is already paid');
  }

  // Check for existing pending payment
  const existingPayment = await Payment.findOne({
    order: orderId,
    status: { $in: ['pending', 'processing'] }
  });

  if (existingPayment) {
    console.log('Found existing pending payment:', existingPayment._id);
    
    // Check if payment is still valid (within timeout period)
    const paymentAge = Date.now() - existingPayment.created_at.getTime();
    const timeout = parseInt(process.env.PAYMENT_TIMEOUT) || 600000; // 10 minutes default
    
    if (paymentAge < timeout) {
      console.log('Returning existing payment data');
      return res.status(200).json({
        success: true,
        message: 'Payment already initialized',
        data: {
          // Placeholder for payment data
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          status: existingPayment.status
        }
      });
    } else {
      // Mark old payment as abandoned
      console.log('Marking old payment as abandoned due to timeout');
      existingPayment.status = 'abandoned';
      await existingPayment.save();
    }
  }

  // Prepare customer data
  const customerEmail = email || order.user.email;
  const customerFirstName = firstName || order.user.firstName || '';
  const customerLastName = lastName || order.user.lastName || '';
  const customerPhone = phone || order.user.phone || '';

  console.log('Customer data:', {
    email: customerEmail,
    firstName: customerFirstName,
    lastName: customerLastName,
    phone: customerPhone
  });

  // Generate unique reference
  const reference = `snappy_${orderId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  console.log('Payment details:', {
    amount: order.totalPrice,
    currency: 'ZAR',
    reference
  });

  try {
    // Initialize payment with Paystack
    const callbackUrl = `${process.env.FRONTEND_URL}/order/${orderId}/verify`;
    
    const paystackData = {
      email: customerEmail,
      amount: order.totalPrice, // Will be converted to cents in the service
      reference: reference,
      callback_url: callbackUrl,
      currency: 'ZAR',
      metadata: {
        order_id: orderId,
        customer_name: `${customerFirstName} ${customerLastName}`.trim(),
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: orderId
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: `${customerFirstName} ${customerLastName}`.trim()
          }
        ]
      }
    };
    
    console.log('Initializing payment with Paystack:', paystackData);
    const paystackResponse = await paystackService.initializeTransaction(paystackData);
    
    if (!paystackResponse.status) {
      throw new Error(paystackResponse.message || 'Payment initialization failed');
    }

    // Save payment record to database
    console.log('Saving payment record to database...');
    const payment = new Payment({
      user: order.user._id,
      order: orderId,
      amount: order.totalPrice * 100, // Convert to cents
      currency: 'ZAR',
      status: 'pending',
      customer: {
        email: customerEmail,
        first_name: customerFirstName,
        last_name: customerLastName,
        phone: customerPhone
      },
      metadata: {
        orderId: orderId,
        userId: order.user._id.toString(),
        customerName: `${customerFirstName} ${customerLastName}`.trim(),
        orderTotal: order.totalPrice,
        paystack_authorization_url: paystackResponse.data.authorization_url,
        paystack_access_code: paystackResponse.data.access_code
      },
      ip_address: req.ip,
      paystack_reference: paystackResponse.data.reference
    });

    const savedPayment = await payment.save();
    console.log('Payment record saved:', savedPayment._id);

    // Update order with payment reference
    order.paymentReference = reference;
    order.paymentStatus = 'pending';
    await order.save();

    console.log('=== PAYMENT INITIALIZATION SUCCESSFUL ===');

    // Return payment initialization data
    res.status(201).json({
      reference: paystackResponse.data.reference,
      email: customerEmail,
      amount: paystackResponse.data.amount || (order.totalPrice * 100), // Amount in cents
      currency: 'ZAR',
      metadata: {
        orderId: orderId,
        customerName: `${customerFirstName} ${customerLastName}`.trim()
      },
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code
    });

  } catch (error) {
    console.log('ERROR: Payment initialization failed:', error.message);
    console.log('Error details:', error.response?.data || error);
    
    res.status(500);
    throw new Error(error.message || 'Payment initialization failed');
  }
});

/**
 * @desc    Verify payment transaction
 * @route   POST /api/payments/verify/:reference
 * @access  Private
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  console.log('=== PAYMENT VERIFICATION STARTED ===');
  console.log('Reference:', reference);
  console.log('User ID:', req.user._id);

  if (!reference) {
    console.log('ERROR: Payment reference is missing');
    res.status(400);
    throw new Error('Payment reference is required');
  }

  // Find payment record
  console.log('Searching for payment record...');
  const payment = await Payment.findOne({ _id: reference })
    .populate('user', 'username email')
    .populate('order');

  if (!payment) {
    console.log('ERROR: Payment not found with reference:', reference);
    res.status(404);
    throw new Error('Payment record not found');
  }

  console.log('Payment found:', {
    id: payment._id,
    status: payment.status,
    amount: payment.amount,
    orderId: payment.order._id
  });

  // Check if user owns the payment
  if (payment.user._id.toString() !== req.user._id.toString()) {
    console.log('ERROR: User not authorized for this payment');
    res.status(403);
    throw new Error('Not authorized to verify this payment');
  }

  try {
    // Verify payment with Paystack
    console.log('Verifying payment with Paystack...');
    
    // Get the Paystack reference
    const paystackReference = payment.paystack_reference || payment.metadata?.paystack_reference;
    
    if (!paystackReference) {
      console.log('ERROR: Paystack reference not found in payment record');
      throw new Error('Paystack reference not found');
    }
    
    const paystackResponse = await paystackService.verifyTransaction(paystackReference);
    
    if (!paystackResponse.status) {
      throw new Error(paystackResponse.message || 'Payment verification failed');
    }
    
    const transactionData = paystackResponse.data;
    const isSuccessful = transactionData.status === 'success';

    // Update payment record
    console.log('Updating payment record...');
    payment.status = isSuccessful ? 'success' : 'failed';
    payment.gateway_response = transactionData.gateway_response || 'Payment processed';
    payment.transaction_date = new Date(transactionData.transaction_date || Date.now());
    payment.channel = transactionData.channel || 'card';
    payment.fees = transactionData.fees || 0;
    
    // Set authorization details if available
    if (transactionData.authorization) {
      payment.authorization = {
        authorization_code: transactionData.authorization.authorization_code,
        bin: transactionData.authorization.bin,
        last4: transactionData.authorization.last4,
        exp_month: transactionData.authorization.exp_month,
        exp_year: transactionData.authorization.exp_year,
        card_type: transactionData.authorization.card_type,
        bank: transactionData.authorization.bank,
        country_code: transactionData.authorization.country_code,
        brand: transactionData.authorization.brand,
        reusable: transactionData.authorization.reusable
      };
    }

    if (isSuccessful) {
      payment.paid_at = new Date(transactionData.paid_at || Date.now());
      payment.payment_method = transactionData.channel || 'card';
    } else {
      payment.failed_reason = transactionData.gateway_response || 'Payment verification failed';
    }

    await payment.save();

    // Update order if payment is successful
    if (isSuccessful) {
      console.log('Payment successful - updating order...');
      const order = payment.order;
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: payment._id,
        status: 'success',
        reference: paystackReference,
        gateway_response: transactionData.gateway_response || 'Payment processed successfully'
      };
      order.paymentStatus = 'completed';
      order.orderStatus = 'processing';
      
      await order.save();
      console.log('Order updated successfully');
    } else {
      console.log('Payment failed - updating order status...');
      payment.order.paymentStatus = 'failed';
      await payment.order.save();
    }

    console.log('=== PAYMENT VERIFICATION COMPLETED ===');

    res.status(200).json({
      success: true,
      message: isSuccessful ? 'Payment verified successfully' : 'Payment failed',
      data: {
        payment: {
          id: payment._id,
          reference: paystackReference,
          status: payment.status,
          amount: payment.formatted_amount,
          method: payment.payment_method,
          date: payment.paid_at || payment.created_at
        },
        order: {
          id: payment.order._id,
          isPaid: payment.order.isPaid,
          status: payment.order.orderStatus
        },
        transaction: {
          id: transactionData.id,
          status: transactionData.status,
          gateway_response: transactionData.gateway_response || 'Payment processed',
          channel: transactionData.channel || 'card',
          fees: transactionData.fees || 0,
          authorization: transactionData.authorization || {}
        }
      }
    });

  } catch (error) {
    console.log('ERROR: Payment verification failed:', error.message);
    console.log('Error details:', error.response?.data || error);
    
    // Update payment status to failed
    payment.status = 'failed';
    payment.failed_reason = error.message;
    await payment.save();
    
    res.status(500);
    throw new Error(error.message || 'Payment verification failed');
  }
});

/**
 * @desc    Handle Paystack webhook events
 * @route   POST /api/payments/webhook 
 * @access  Public
 */
const handleWebhook = asyncHandler(async (req, res) => {
  console.log('=== PAYSTACK WEBHOOK RECEIVED ===');
  
  try {
    const signature = req.headers['x-paystack-signature'];
    if (!signature) {
      console.log('ERROR: Missing Paystack signature header');
      return res.status(400).json({ error: 'Missing signature header' });
    }
    
    // Verify webhook signature
    const isValid = paystackService.verifyWebhookSignature(signature, req.body);
    if (!isValid) {
      console.log('ERROR: Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const event = req.body;
    console.log('Webhook event type:', event.event);
    
    // Process different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;
      case 'transfer.success':
        // Handle transfer success
        break;
      case 'transfer.failed':
        // Handle transfer failure
        break;
      case 'refund.processed':
        await handleRefundProcessed(event.data);
        break;
      default:
        console.log('Unhandled webhook event type:', event.event);
    }
    
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.log('ERROR: Webhook processing failed:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper function to handle successful charge webhook
const handleChargeSuccess = async (data) => {
  console.log('Processing successful charge webhook:', data.reference);
  
  try {
    // Find the payment by Paystack reference
    const payment = await Payment.findOne({ 
      $or: [
        { paystack_reference: data.reference },
        { 'metadata.paystack_reference': data.reference }
      ]
    }).populate('order');
    
    if (!payment) {
      console.log('Payment not found for reference:', data.reference);
      return;
    }
    
    // Update payment status if not already successful
    if (payment.status !== 'success') {
      payment.status = 'success';
      payment.gateway_response = data.gateway_response || 'Charge successful';
      payment.paid_at = new Date(data.paid_at || Date.now());
      payment.channel = data.channel || 'card';
      payment.fees = data.fees || 0;
      
      // Set authorization details if available
      if (data.authorization) {
        payment.authorization = {
          authorization_code: data.authorization.authorization_code,
          bin: data.authorization.bin,
          last4: data.authorization.last4,
          exp_month: data.authorization.exp_month,
          exp_year: data.authorization.exp_year,
          card_type: data.authorization.card_type,
          bank: data.authorization.bank,
          country_code: data.authorization.country_code,
          brand: data.authorization.brand,
          reusable: data.authorization.reusable
        };
      }
      
      await payment.save();
      console.log('Payment updated to success:', payment._id);
      
      // Update the associated order
      if (payment.order && !payment.order.isPaid) {
        payment.order.isPaid = true;
        payment.order.paidAt = new Date();
        payment.order.paymentResult = {
          id: payment._id,
          status: 'success',
          reference: data.reference,
          gateway_response: data.gateway_response || 'Payment successful'
        };
        payment.order.paymentStatus = 'completed';
        payment.order.orderStatus = 'processing';
        
        await payment.order.save();
        console.log('Order updated to paid:', payment.order._id);
      }
    } else {
      console.log('Payment already marked as successful:', payment._id);
    }
  } catch (error) {
    console.error('Error processing charge.success webhook:', error);
  }
};

// Helper function to handle failed charge webhook
const handleChargeFailed = async (data) => {
  console.log('Processing failed charge webhook:', data.reference);
  
  try {
    // Find the payment by Paystack reference
    const payment = await Payment.findOne({ 
      $or: [
        { paystack_reference: data.reference },
        { 'metadata.paystack_reference': data.reference }
      ]
    }).populate('order');
    
    if (!payment) {
      console.log('Payment not found for reference:', data.reference);
      return;
    }
    
    // Update payment status
    payment.status = 'failed';
    payment.gateway_response = data.gateway_response || 'Charge failed';
    payment.transaction_date = new Date(data.transaction_date || Date.now());
    payment.failed_reason = data.gateway_response || 'Payment processing failed';
    
    await payment.save();
    console.log('Payment updated to failed:', payment._id);
    
    // Update the associated order
    if (payment.order) {
      payment.order.paymentStatus = 'failed';
      await payment.order.save();
      console.log('Order updated to payment failed:', payment.order._id);
    }
  } catch (error) {
    console.error('Error processing charge.failed webhook:', error);
  }
};

// Helper function to handle refund processed webhook
const handleRefundProcessed = async (data) => {
  console.log('Processing refund processed webhook:', data.reference);
  
  try {
    // Find the payment by reference
    const payment = await Payment.findOne({
      refund_reference: data.reference
    });
    
    if (!payment) {
      console.log('Payment not found for refund reference:', data.reference);
      return;
    }
    
    // Update refund status
    payment.refund_status = 'success';
    payment.refunded_at = new Date(data.created_at || Date.now());
    
    await payment.save();
    console.log('Payment refund status updated:', payment._id);
    
    // If order exists, update its status
    if (payment.order) {
      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = 'refunded';
        await order.save();
        console.log('Order updated to refunded:', order._id);
      }
    }
  } catch (error) {
    console.error('Error processing refund.processed webhook:', error);
  }
};

/**
 * @desc    Get payment history for user
 * @route   GET /api/payments/history
 * @access  Private
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  console.log('Getting payment history for user:', req.user._id);

  const payments = await Payment.find({ user: req.user._id })
    .populate('order', 'orderItems totalPrice orderStatus')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    data: payments.map(payment => payment.summary),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'username email')
    .populate('order');

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  // Check if user owns the payment or is admin
  if (payment.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this payment');
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

/**
 * @desc    Refund payment (Admin only)
 * @route   POST /api/payments/:id/refund
 * @access  Admin
 */
const refundPayment = asyncHandler(async (req, res) => {
  const { reason, amount } = req.body;
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (!payment.canBeRefunded()) {
    res.status(400);
    throw new Error('Payment cannot be refunded');
  }

  try {
    console.log('Initiating refund with Paystack...');
    
    // Get the Paystack transaction reference
    const paystackReference = payment.paystack_reference || payment.metadata?.paystack_reference;
    if (!paystackReference) {
      throw new Error('Paystack reference not found');
    }
    
    // Call Paystack refund API
    const refundAmount = amount ? amount : payment.amount / 100; // Convert from cents if no amount specified
    const refundResponse = await paystackService.refundTransaction(paystackReference, refundAmount);
    
    if (!refundResponse.status) {
      throw new Error(refundResponse.message || 'Refund failed');
    }

    payment.refund_status = 'processing';
    payment.refund_amount = amount ? amount * 100 : payment.amount;
    payment.refund_reference = refundResponse.data.reference || refundResponse.data?.transaction?.reference;
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      data: refundResponse.data
    });
  } catch (error) {
    console.log('ERROR: Refund failed:', error.message);
    res.status(500);
    throw new Error(error.message || 'Refund failed');
  }
});

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentById,
  refundPayment,
  handleChargeSuccess,
  handleChargeFailed
};
