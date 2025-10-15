const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/300x200',
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    level: {
      type: Number,
      default: 0, // 0 = root, 1 = subcategory, etc.
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
    productCount: {
      type: Number,
      default: 0,
    },
    // Display settings
    showInMenu: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String, // For FontAwesome or other icon classes
    },
    color: {
      type: String, // Hex color for category theming
    },
  },
  {
    timestamps: true,
  }
);

// Create index for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });

// Pre-save middleware to generate slug
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
