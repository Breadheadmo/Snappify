const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Payment = require('../models/paymentModel');
const { sendOrderStatusEmail, sendLowStockAlert } = require('../utils/emailService');

/**
 * @desc    Clear all products
 * @route   DELETE /api/admin/products/clear
 * @access  Private/Admin
 */
const clearAllProducts = asyncHandler(async (req, res) => {
  console.log('Clearing all products...');

  try {
    const result = await Product.deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} products`);
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} products`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing products:', error);
    res.status(500);
    throw new Error('Failed to clear products');
  }
});

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  console.log('Getting dashboard stats...');

  try {
    // Get total counts
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get pending orders
    const pendingOrders = await Order.countDocuments({ 
      orderStatus: { $in: ['pending', 'processing'] } 
    });

    // Get low stock products
    const lowStockProducts = await Product.countDocuments({ 
      countInStock: { $lt: 10 }, 
      inStock: true 
    });

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get monthly sales data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          isPaid: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      salesData
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500);
    throw new Error('Failed to get dashboard statistics');
  }
});

/**
 * @desc    Get all users with pagination and search
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const role = req.query.role || '';

  const skip = (page - 1) * limit;

  // Build search query
  let query = {};
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) {
    query.isAdmin = role === 'admin';
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  res.json({
    users,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    total
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user's order history
  const orders = await Order.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    user,
    orders
  });
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { isAdmin } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isAdmin = isAdmin;
  await user.save();

  res.json({
    message: 'User role updated successfully',
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Don't allow deleting other admins
  if (user.isAdmin) {
    res.status(400);
    throw new Error('Cannot delete admin users');
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted successfully' });
});

/**
 * @desc    Get all products with pagination and search
 * @route   GET /api/admin/products
 * @access  Private/Admin
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const category = req.query.category || '';

  const skip = (page - 1) * limit;

  // Build search query
  let query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) {
    query.category = category;
  }

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);

  res.json({
    products,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    total
  });
});

/**
 * @desc    Get product by ID
 * @route   GET /api/admin/products/:id
 * @access  Private/Admin
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

/**
 * @desc    Update product
 * @route   PUT /api/admin/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Update product fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      product[key] = req.body[key];
    }
  });

  // Update stock status
  product.inStock = product.countInStock > 0;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

/**
 * @desc    Update product stock
 * @route   PUT /api/admin/products/:id/stock
 * @access  Private/Admin
 */
const updateProductStock = asyncHandler(async (req, res) => {
  const { countInStock } = req.body;
  
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.countInStock = countInStock;
  product.inStock = countInStock > 0;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

/**
 * @desc    Delete product
 * @route   DELETE /api/admin/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted successfully' });
});

/**
 * @desc    Get all orders with pagination and search
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const status = req.query.status || '';

  const skip = (page - 1) * limit;

  // Build search query
  let query = {};
  if (search) {
    // Search in order ID, customer name, or email
    const users = await User.find({
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    
    const userIds = users.map(user => user._id);
    
    query.$or = [
      { _id: { $regex: search, $options: 'i' } },
      { user: { $in: userIds } }
    ];
  }
  if (status) {
    query.orderStatus = status;
  }

  const orders = await Order.find(query)
    .populate('user', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  res.json({
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    total
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/admin/orders/:id
 * @access  Private/Admin
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'username email')
    .populate('orderItems.product', 'name images price');
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(order);
});

/**
 * @desc    Update order status
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const order = await Order.findById(req.params.id)
    .populate('user', 'username email firstName lastName');
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const oldStatus = order.orderStatus;
  order.orderStatus = status;
  
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  const updatedOrder = await order.save();
  
  // Send status update email to customer
  if (oldStatus !== status) {
    try {
      await sendOrderStatusEmail(updatedOrder, order.user, oldStatus, status);
      console.log('Order status email sent successfully');
    } catch (emailError) {
      console.error('Failed to send order status email:', emailError);
      // Don't fail the status update if email fails
    }
  }
  
  res.json(updatedOrder);
});

/**
 * @desc    Delete order
 * @route   DELETE /api/admin/orders/:id
 * @access  Private/Admin
 */
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Order deleted successfully' });
});

/**
 * @desc    Get analytics data
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  
  let dateRange;
  const now = new Date();
  
  switch (period) {
    case '7d':
      dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      dateRange = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Sales analytics
  const salesAnalytics = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange },
        isPaid: true
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange },
        isPaid: true
      }
    },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        name: '$product.name',
        totalSold: 1,
        revenue: 1
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    salesAnalytics,
    topProducts
  });
});

/**
 * @desc    Get reports
 * @route   GET /api/admin/reports
 * @access  Private/Admin
 */
const getReports = asyncHandler(async (req, res) => {
  // Generate various reports
  const { type = 'sales', period = '30d' } = req.query;
  
  // Implementation for different report types
  res.json({
    message: `${type} report for ${period}`,
    data: []
  });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getAnalytics,
  getReports,
  clearAllProducts,
};
