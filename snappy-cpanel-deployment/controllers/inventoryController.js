const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/productModel');

/**
 * @desc    Get low stock products
 * @route   GET /api/products/low-stock
 * @access  Private/Admin
 */
const getLowStockProducts = asyncHandler(async (req, res) => {
  // Threshold can be set via query, default to 5
  const threshold = Number(req.query.threshold) || 5;
  const products = await Product.find({ countInStock: { $gt: 0, $lte: threshold } });
  res.json(products);
});

/**
 * @desc    Get out-of-stock products
 * @route   GET /api/products/out-of-stock
 * @access  Private/Admin
 */
const getOutOfStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ countInStock: { $lte: 0 } });
  res.json(products);
});

/**
 * @desc    Restock a product
 * @route   PUT /api/products/:id/restock
 * @access  Private/Admin
 */
const restockProduct = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.countInStock += Number(amount);
  product.inStock = product.countInStock > 0;
  await product.save();
  res.json(product);
});

module.exports = {
  getLowStockProducts,
  getOutOfStockProducts,
  restockProduct,
};
