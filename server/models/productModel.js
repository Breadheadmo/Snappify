const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    comment: {
      type: String,
      required: true,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const variantSchema = mongoose.Schema({
  size: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    trim: true,
  },
  material: {
    type: String,
    trim: true,
  },
  style: {
    type: String,
    trim: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0,
  },
  images: [String],
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    // Product variants for different sizes, colors, etc.
    variants: [variantSchema],
    hasVariants: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    inStock: {
      type: Boolean,
      required: true,
      default: true,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    features: [String],
    specifications: {
      type: Map,
      of: String,
    },
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    tags: [String],
    weight: {
      type: String,
    },
    dimensions: {
      type: String,
    },
    warranty: {
      type: String,
    },
    // SEO fields
    seoTitle: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
    // Status fields
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Inventory management
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    // Analytics
    viewCount: {
      type: Number,
      default: 0,
    },
    purchaseCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text', 
  category: 'text',
  tags: 'text'
});

// Index for filtering
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
