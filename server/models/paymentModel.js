const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'ZAR',
      enum: ['ZAR', 'USD', 'EUR', 'GBP', 'NGN'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'success', 'failed', 'abandoned', 'cancelled', 'processing'],
      default: 'pending',
      index: true,
    },
    payment_method: {
      type: String,
      enum: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    },
    channel: {
      type: String,
    },
    fees: {
      type: Number,
      default: 0,
      min: 0,
    },
    customer: {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      first_name: {
        type: String,
        trim: true,
      },
      last_name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    authorization: {
      authorization_code: String,
      bin: String,
      last4: String,
      exp_month: String,
      exp_year: String,
      channel: String,
      card_type: String,
      bank: String,
      country_code: String,
      brand: String,
      reusable: Boolean,
      signature: String,
    },
    transaction_date: {
      type: Date,
    },
    gateway_response: {
      type: String,
    },
    webhook_data: {
      type: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    paid_at: {
      type: Date,
    },
    failed_reason: {
      type: String,
    },
    refund_status: {
      type: String,
      enum: ['none', 'pending', 'processing', 'success', 'failed'],
      default: 'none',
    },
    refund_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refund_reference: {
      type: String,
    },
    refunded_at: {
      type: Date,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    ip_address: {
      type: String,
    },
    // Paystack specific fields
    paystack_reference: {
      type: String,
      index: true,
    },
    paystack_access_code: {
      type: String,
    },
    created_at: {
      type: Date,
    },
    updated_at: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Compound indexes for efficient queries
paymentSchema.index({ user: 1, created_at: -1 });
paymentSchema.index({ order: 1, status: 1 });
paymentSchema.index({ status: 1, created_at: -1 });
paymentSchema.index({ 'customer.email': 1, created_at: -1 });

// Virtual for formatted amount
paymentSchema.virtual('formatted_amount').get(function() {
  return `${this.currency} ${(this.amount / 100).toFixed(2)}`;
});

// Virtual for payment summary
paymentSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    amount: this.formatted_amount,
    status: this.status,
    method: this.payment_method,
    date: this.created_at
  };
});

// Instance method to check if payment is successful
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'success' && this.paid_at;
};

// Instance method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function() {
  return this.status === 'success' && 
         this.refund_status === 'none' && 
         this.paid_at &&
         (Date.now() - this.paid_at.getTime()) < (365 * 24 * 60 * 60 * 1000); // Within 1 year
};

// Static method to find by reference
paymentSchema.statics.findByReference = function(reference) {
  return this.findOne({ 
    $or: [
      { _id: reference },
      { paystack_reference: reference },
      { 'metadata.paystack_reference': reference }
    ]
  });
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        created_at: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total_amount: { $sum: '$amount' }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.attempts = (this.attempts || 0) + 1;
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
