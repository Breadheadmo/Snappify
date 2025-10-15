const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/productModel');
const StockAlert = require('../models/stockAlertModel');

/**
 * @desc    Get all stock alerts
 * @route   GET /api/stock-alerts
 * @access  Private/Admin
 */
const getStockAlerts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const status = req.query.status; // 'resolved', 'unresolved', 'all'
  const priority = req.query.priority; // 'low', 'medium', 'high', 'critical'
  const alertType = req.query.alertType; // 'low_stock', 'out_of_stock', 'restock'

  let filter = {};

  if (status === 'resolved') {
    filter.isResolved = true;
  } else if (status === 'unresolved') {
    filter.isResolved = false;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (alertType) {
    filter.alertType = alertType;
  }

  const skip = (page - 1) * limit;

  const alerts = await StockAlert.find(filter)
    .populate('product', 'name images price category')
    .sort({ priority: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await StockAlert.countDocuments(filter);

  res.json({
    alerts,
    page,
    pages: Math.ceil(total / limit),
    total,
    hasMore: skip + alerts.length < total,
  });
});

/**
 * @desc    Create stock alert
 * @route   POST /api/stock-alerts
 * @access  Private/Admin
 */
const createStockAlert = asyncHandler(async (req, res) => {
  const {
    productId,
    variantId,
    alertType,
    threshold,
    currentStock,
    message,
    priority,
  } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if alert already exists for this product/variant
  const existingAlert = await StockAlert.findOne({
    product: productId,
    variant: variantId || null,
    alertType,
    isResolved: false,
  });

  if (existingAlert) {
    res.status(400);
    throw new Error('Alert already exists for this product/variant');
  }

  const alert = await StockAlert.create({
    product: productId,
    variant: variantId,
    alertType,
    threshold: threshold || 10,
    currentStock,
    message,
    priority: priority || 'medium',
    category: product.category,
    productName: product.name,
    sku: product.sku,
  });

  const populatedAlert = await StockAlert.findById(alert._id)
    .populate('product', 'name images price category');

  res.status(201).json(populatedAlert);
});

/**
 * @desc    Update stock alert
 * @route   PUT /api/stock-alerts/:id
 * @access  Private/Admin
 */
const updateStockAlert = asyncHandler(async (req, res) => {
  const alert = await StockAlert.findById(req.params.id);

  if (!alert) {
    res.status(404);
    throw new Error('Stock alert not found');
  }

  const {
    threshold,
    priority,
    isResolved,
    notificationSent,
  } = req.body;

  if (threshold !== undefined) alert.threshold = threshold;
  if (priority) alert.priority = priority;
  if (notificationSent !== undefined) {
    alert.notificationSent = notificationSent;
    if (notificationSent && !alert.notificationSentAt) {
      alert.notificationSentAt = new Date();
    }
  }
  if (isResolved !== undefined) {
    alert.isResolved = isResolved;
    if (isResolved && !alert.resolvedAt) {
      alert.resolvedAt = new Date();
    } else if (!isResolved) {
      alert.resolvedAt = null;
    }
  }

  const updatedAlert = await alert.save();
  const populatedAlert = await StockAlert.findById(updatedAlert._id)
    .populate('product', 'name images price category');

  res.json(populatedAlert);
});

/**
 * @desc    Delete stock alert
 * @route   DELETE /api/stock-alerts/:id
 * @access  Private/Admin
 */
const deleteStockAlert = asyncHandler(async (req, res) => {
  const alert = await StockAlert.findById(req.params.id);

  if (!alert) {
    res.status(404);
    throw new Error('Stock alert not found');
  }

  await StockAlert.findByIdAndDelete(req.params.id);
  res.json({ message: 'Stock alert deleted successfully' });
});

/**
 * @desc    Check and create stock alerts for all products
 * @route   POST /api/stock-alerts/check-all
 * @access  Private/Admin
 */
const checkAllProductsStock = asyncHandler(async (req, res) => {
  const lowStockThreshold = Number(req.query.threshold) || 10;
  
  const products = await Product.find({});
  const alertsCreated = [];

  for (const product of products) {
    // Check main product stock
    if (product.countInStock <= lowStockThreshold) {
      const existingAlert = await StockAlert.findOne({
        product: product._id,
        variant: null,
        alertType: product.countInStock === 0 ? 'out_of_stock' : 'low_stock',
        isResolved: false,
      });

      if (!existingAlert) {
        const alert = await StockAlert.create({
          product: product._id,
          alertType: product.countInStock === 0 ? 'out_of_stock' : 'low_stock',
          threshold: lowStockThreshold,
          currentStock: product.countInStock,
          message: `${product.name} is ${product.countInStock === 0 ? 'out of stock' : 'running low'}`,
          priority: product.countInStock === 0 ? 'critical' : 'high',
          category: product.category,
          productName: product.name,
          sku: product.sku,
        });
        alertsCreated.push(alert);
      }
    }

    // Check variant stock if variants exist
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.countInStock <= lowStockThreshold) {
          const existingVariantAlert = await StockAlert.findOne({
            product: product._id,
            variant: variant._id,
            alertType: variant.countInStock === 0 ? 'out_of_stock' : 'low_stock',
            isResolved: false,
          });

          if (!existingVariantAlert) {
            const variantName = `${variant.size || ''} ${variant.color || ''} ${variant.material || ''}`.trim();
            const alert = await StockAlert.create({
              product: product._id,
              variant: variant._id,
              alertType: variant.countInStock === 0 ? 'out_of_stock' : 'low_stock',
              threshold: lowStockThreshold,
              currentStock: variant.countInStock,
              message: `${product.name} (${variantName}) is ${variant.countInStock === 0 ? 'out of stock' : 'running low'}`,
              priority: variant.countInStock === 0 ? 'critical' : 'high',
              category: product.category,
              productName: product.name,
              sku: variant.sku || product.sku,
            });
            alertsCreated.push(alert);
          }
        }
      }
    }
  }

  res.json({
    message: `Stock check completed. Created ${alertsCreated.length} new alerts.`,
    alertsCreated: alertsCreated.length,
    alerts: alertsCreated,
  });
});

/**
 * @desc    Get stock statistics
 * @route   GET /api/stock-alerts/stats
 * @access  Private/Admin
 */
const getStockStats = asyncHandler(async (req, res) => {
  const [
    totalAlerts,
    unresolvedAlerts,
    criticalAlerts,
    lowStockProducts,
    outOfStockProducts,
  ] = await Promise.all([
    StockAlert.countDocuments({}),
    StockAlert.countDocuments({ isResolved: false }),
    StockAlert.countDocuments({ priority: 'critical', isResolved: false }),
    Product.countDocuments({ countInStock: { $lte: 10, $gt: 0 } }),
    Product.countDocuments({ countInStock: 0 }),
  ]);

  // Get alerts by category
  const alertsByCategory = await StockAlert.aggregate([
    { $match: { isResolved: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    totalAlerts,
    unresolvedAlerts,
    criticalAlerts,
    lowStockProducts,
    outOfStockProducts,
    alertsByCategory,
  });
});

/**
 * @desc    Resolve multiple alerts
 * @route   PUT /api/stock-alerts/resolve-multiple
 * @access  Private/Admin
 */
const resolveMultipleAlerts = asyncHandler(async (req, res) => {
  const { alertIds } = req.body;

  if (!alertIds || !Array.isArray(alertIds)) {
    res.status(400);
    throw new Error('Alert IDs array is required');
  }

  const result = await StockAlert.updateMany(
    { _id: { $in: alertIds } },
    { 
      isResolved: true, 
      resolvedAt: new Date() 
    }
  );

  res.json({
    message: `${result.modifiedCount} alerts resolved successfully`,
    modifiedCount: result.modifiedCount,
  });
});

module.exports = {
  getStockAlerts,
  createStockAlert,
  updateStockAlert,
  deleteStockAlert,
  checkAllProductsStock,
  getStockStats,
  resolveMultipleAlerts,
};