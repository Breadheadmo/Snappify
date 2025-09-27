const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const { sendOrderTrackingEmail, sendShippingConfirmationEmail } = require('../utils/emailService');

/**
 * @desc    Update order tracking information
 * @route   PUT /api/orders/:id/tracking
 * @access  Private/Admin
 */
const updateOrderTracking = asyncHandler(async (req, res) => {
  const { trackingNumber, carrier, currentStage, estimatedDelivery, trackingUrl, deliveredAt, deliveredTo } = req.body;

  const order = await Order.findById(req.params.id).populate('user', 'username email firstName lastName');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Update tracking information
  order.trackingNumber = trackingNumber || order.trackingNumber;
  order.carrier = carrier || order.carrier;
  order.trackingStage = currentStage || order.trackingStage;
  order.estimatedDelivery = estimatedDelivery || order.estimatedDelivery;
  order.trackingUrl = trackingUrl || order.trackingUrl;

  if (deliveredAt) {
    order.deliveredAt = deliveredAt;
    order.isDelivered = true;
    order.orderStatus = 'delivered';
  }

  if (deliveredTo) {
    order.deliveredTo = deliveredTo;
  }

  // Save order
  const updatedOrder = await order.save();

  // Send tracking email if tracking info provided
  if (trackingNumber && currentStage) {
    const trackingInfo = {
      trackingNumber,
      carrier,
      currentStage,
      estimatedDelivery,
      trackingUrl,
      deliveredAt,
      deliveredTo
    };

    if (currentStage === 'shipped' && !order.shippingEmailSent) {
      // Send shipping confirmation
      await sendShippingConfirmationEmail(order, order.user, trackingInfo);
      order.shippingEmailSent = true;
      await order.save();
    } else {
      // Send tracking update
      await sendOrderTrackingEmail(order, order.user, trackingInfo);
    }
  }

  res.json({
    success: true,
    message: 'Order tracking updated successfully',
    order: updatedOrder
  });
});

/**
 * @desc    Get order tracking information
 * @route   GET /api/orders/:id/tracking
 * @access  Private
 */
const getOrderTracking = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user owns the order or is admin
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this order tracking');
  }

  const trackingInfo = {
    orderId: order._id,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    currentStage: order.trackingStage || 'processing',
    estimatedDelivery: order.estimatedDelivery,
    trackingUrl: order.trackingUrl,
    orderStatus: order.orderStatus,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt,
    deliveredTo: order.deliveredTo,
    createdAt: order.createdAt,
    shippingAddress: order.shippingAddress
  };

  res.json({
    success: true,
    data: trackingInfo
  });
});

/**
 * @desc    Track order by tracking number (public)
 * @route   GET /api/tracking/:trackingNumber
 * @access  Public
 */
const trackByNumber = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.params;

  const order = await Order.findOne({ trackingNumber }).select(
    'trackingNumber carrier trackingStage estimatedDelivery trackingUrl orderStatus isDelivered deliveredAt createdAt shippingAddress orderItems totalPrice'
  );

  if (!order) {
    res.status(404);
    throw new Error('Tracking number not found');
  }

  const trackingInfo = {
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    currentStage: order.trackingStage || 'processing',
    estimatedDelivery: order.estimatedDelivery,
    trackingUrl: order.trackingUrl,
    orderStatus: order.orderStatus,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt,
    createdAt: order.createdAt,
    totalItems: order.orderItems.length,
    totalPrice: order.totalPrice,
    // Only show city and country for privacy
    deliveryLocation: {
      city: order.shippingAddress.city,
      country: order.shippingAddress.country
    }
  };

  res.json({
    success: true,
    data: trackingInfo
  });
});

/**
 * @desc    Bulk update tracking for multiple orders
 * @route   PUT /api/admin/orders/bulk-tracking
 * @access  Private/Admin
 */
const bulkUpdateTracking = asyncHandler(async (req, res) => {
  const { updates } = req.body; // Array of { orderId, trackingNumber, carrier, currentStage }

  if (!updates || !Array.isArray(updates)) {
    res.status(400);
    throw new Error('Updates array is required');
  }

  const results = [];

  for (const update of updates) {
    try {
      const order = await Order.findById(update.orderId).populate('user', 'username email firstName lastName');
      
      if (order) {
        order.trackingNumber = update.trackingNumber || order.trackingNumber;
        order.carrier = update.carrier || order.carrier;
        order.trackingStage = update.currentStage || order.trackingStage;
        order.estimatedDelivery = update.estimatedDelivery || order.estimatedDelivery;
        order.trackingUrl = update.trackingUrl || order.trackingUrl;

        await order.save();

        // Send tracking email
        if (update.trackingNumber && update.currentStage) {
          const trackingInfo = {
            trackingNumber: update.trackingNumber,
            carrier: update.carrier,
            currentStage: update.currentStage,
            estimatedDelivery: update.estimatedDelivery,
            trackingUrl: update.trackingUrl
          };

          if (update.currentStage === 'shipped' && !order.shippingEmailSent) {
            await sendShippingConfirmationEmail(order, order.user, trackingInfo);
            order.shippingEmailSent = true;
            await order.save();
          } else {
            await sendOrderTrackingEmail(order, order.user, trackingInfo);
          }
        }

        results.push({
          orderId: order._id,
          success: true,
          message: 'Updated successfully'
        });
      } else {
        results.push({
          orderId: update.orderId,
          success: false,
          message: 'Order not found'
        });
      }
    } catch (error) {
      results.push({
        orderId: update.orderId,
        success: false,
        message: error.message
      });
    }
  }

  res.json({
    success: true,
    message: 'Bulk tracking update completed',
    results
  });
});

module.exports = {
  updateOrderTracking,
  getOrderTracking,
  trackByNumber,
  bulkUpdateTracking
};
