const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/productModel');
const User = require('../models/userModel');

/**
 * @desc    Get product recommendations for a user
 * @route   GET /api/recommendations
 * @access  Private
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = Number(req.query.limit) || 10;

  // Get user's purchase history if Order model exists
  // const Order = require('../models/orderModel');
  // const userOrders = await Order.find({ user: userId, isPaid: true })
  //   .populate('orderItems.product');

  // For now, use user's wishlist and viewed products as basis
  const user = await User.findById(userId).populate('wishlist');
  
  let recommendations = [];

  // Strategy 1: Similar products based on categories
  if (user.wishlist && user.wishlist.length > 0) {
    const categories = user.wishlist.map(item => item.category);
    const uniqueCategories = [...new Set(categories)];

    const similarProducts = await Product.find({
      category: { $in: uniqueCategories },
      _id: { $nin: user.wishlist.map(item => item._id) }
    })
    .sort({ rating: -1, numReviews: -1 })
    .limit(limit);

    recommendations = [...recommendations, ...similarProducts];
  }

  // Strategy 2: Popular products in similar price range
  if (user.wishlist && user.wishlist.length > 0) {
    const avgPrice = user.wishlist.reduce((acc, item) => acc + item.price, 0) / user.wishlist.length;
    const priceRange = avgPrice * 0.3; // 30% range

    const priceBasedProducts = await Product.find({
      price: { 
        $gte: avgPrice - priceRange, 
        $lte: avgPrice + priceRange 
      },
      _id: { $nin: user.wishlist.map(item => item._id) }
    })
    .sort({ rating: -1, numReviews: -1 })
    .limit(5);

    recommendations = [...recommendations, ...priceBasedProducts];
  }

  // Strategy 3: Top-rated products if no wishlist
  if (recommendations.length === 0) {
    const topRated = await Product.find({ rating: { $gte: 4 } })
      .sort({ rating: -1, numReviews: -1 })
      .limit(limit);

    recommendations = [...recommendations, ...topRated];
  }

  // Remove duplicates and limit results
  const uniqueRecommendations = recommendations.filter((product, index, self) =>
    index === self.findIndex(p => p._id.toString() === product._id.toString())
  ).slice(0, limit);

  res.json(uniqueRecommendations);
});

/**
 * @desc    Get related products for a specific product
 * @route   GET /api/recommendations/product/:id
 * @access  Public
 */
const getRelatedProducts = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const limit = Number(req.query.limit) || 6;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Strategy 1: Same category products
  let relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: productId }
  })
  .sort({ rating: -1, numReviews: -1 })
  .limit(limit);

  // Strategy 2: Similar brand if same category doesn't have enough
  if (relatedProducts.length < limit && product.brand) {
    const brandProducts = await Product.find({
      brand: product.brand,
      _id: { $ne: productId, $nin: relatedProducts.map(p => p._id) }
    })
    .sort({ rating: -1 })
    .limit(limit - relatedProducts.length);

    relatedProducts = [...relatedProducts, ...brandProducts];
  }

  // Strategy 3: Similar price range if still not enough
  if (relatedProducts.length < limit) {
    const priceRange = product.price * 0.5; // 50% range
    const priceProducts = await Product.find({
      price: { 
        $gte: product.price - priceRange, 
        $lte: product.price + priceRange 
      },
      _id: { $ne: productId, $nin: relatedProducts.map(p => p._id) }
    })
    .sort({ rating: -1 })
    .limit(limit - relatedProducts.length);

    relatedProducts = [...relatedProducts, ...priceProducts];
  }

  res.json(relatedProducts.slice(0, limit));
});

/**
 * @desc    Get trending products based on recent activity
 * @route   GET /api/recommendations/trending
 * @access  Public
 */
const getTrendingProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const days = Number(req.query.days) || 7;

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  // This would work better with view/purchase tracking
  // For now, use products with recent reviews as proxy for trending
  const trendingProducts = await Product.aggregate([
    {
      $addFields: {
        recentReviewsCount: {
          $size: {
            $filter: {
              input: '$reviews',
              cond: { $gte: ['$$this.createdAt', dateThreshold] }
            }
          }
        }
      }
    },
    {
      $match: {
        recentReviewsCount: { $gt: 0 }
      }
    },
    {
      $sort: {
        recentReviewsCount: -1,
        rating: -1,
        numReviews: -1
      }
    },
    {
      $limit: limit
    }
  ]);

  // If no trending products, fall back to recently added products
  if (trendingProducts.length === 0) {
    const recentProducts = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return res.json(recentProducts);
  }

  res.json(trendingProducts);
});

/**
 * @desc    Get products frequently bought together
 * @route   GET /api/recommendations/frequently-bought/:id
 * @access  Public
 */
const getFrequentlyBoughtTogether = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const limit = Number(req.query.limit) || 4;

  // This would require order analysis for proper implementation
  // For now, return products from same category as placeholder
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: productId },
    price: { $lte: product.price * 1.5 } // Not too expensive
  })
  .sort({ rating: -1, numReviews: -1 })
  .limit(limit);

  res.json(relatedProducts);
});

/**
 * @desc    Record product view for recommendation algorithm
 * @route   POST /api/recommendations/view
 * @access  Private
 */
const recordProductView = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  
  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  // For future implementation: store user views in a separate collection
  // This would help improve recommendation accuracy
  
  res.json({ message: 'Product view recorded' });
});

module.exports = {
  getRecommendations,
  getRelatedProducts,
  getTrendingProducts,
  getFrequentlyBoughtTogether,
  recordProductView,
};