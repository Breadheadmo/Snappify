const mongoose = require('mongoose');

const stockAlertSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product.variants',
    },
    alertType: {
      type: String,
      required: true,
      enum: ['low_stock', 'out_of_stock', 'restock'],
      default: 'low_stock',
    },
    threshold: {
      type: Number,
      required: true,
      default: 10,
    },
    currentStock: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    category: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
stockAlertSchema.index({ product: 1 });
stockAlertSchema.index({ alertType: 1 });
stockAlertSchema.index({ isResolved: 1 });
stockAlertSchema.index({ createdAt: -1 });
stockAlertSchema.index({ priority: 1 });

const StockAlert = mongoose.model('StockAlert', stockAlertSchema);

module.exports = StockAlert;