const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const asyncHandler = require('../middleware/asyncHandler');

// Sales report: total sales, orders, top products
const getSalesReport = asyncHandler(async (req, res) => {
  const totalSales = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } }
  ]);
  const topProducts = await Order.aggregate([
    { $unwind: "$orderItems" },
    { $group: { _id: "$orderItems.product", sold: { $sum: "$orderItems.quantity" } } },
    { $sort: { sold: -1 } },
    { $limit: 5 }
  ]);
  res.json({
    totalSales: totalSales[0]?.total || 0,
    totalOrders: totalSales[0]?.count || 0,
    topProducts,
  });
});

// Inventory report: stock status
const getInventoryReport = asyncHandler(async (req, res) => {
  const lowStock = await Product.find({ countInStock: { $lte: 5 } }, "name countInStock");
  const outOfStock = await Product.find({ inStock: false }, "name countInStock");
  const totalProducts = await Product.countDocuments();
  res.json({
    totalProducts,
    lowStock,
    outOfStock,
  });
});

// User analytics: registrations, active users
const getUserAnalytics = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("username email createdAt");
  res.json({
    totalUsers,
    recentUsers,
  });
});

module.exports = {
  getSalesReport,
  getInventoryReport,
  getUserAnalytics,
};
