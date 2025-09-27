const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Credit Card',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    shippingMethod: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      description: { type: String },
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      default: 'Processing',
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    },
    orderStatus: {
      type: String,
      required: true,
      default: 'processing',
      enum: ['processing', 'confirmed', 'preparing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
    },
    trackingNumber: {
      type: String,
    },
    carrier: {
      type: String,
      enum: ['DHL', 'FedEx', 'UPS', 'USPS', 'Royal Mail', 'PostNet', 'Aramex', 'Other'],
    },
    trackingStage: {
      type: String,
      enum: ['processing', 'confirmed', 'preparing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'],
      default: 'processing',
    },
    trackingUrl: {
      type: String,
    },
    estimatedDelivery: {
      type: Date,
    },
    deliveredTo: {
      type: String,
    },
    shippingEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
