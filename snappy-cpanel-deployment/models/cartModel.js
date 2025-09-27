const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

// Method to calculate total price
cartSchema.methods.calculateTotalPrice = function() {
  this.totalPrice = this.items.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );
  return this.totalPrice;
};

// Middleware to update total price before saving
cartSchema.pre('save', function(next) {
  this.calculateTotalPrice();
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
