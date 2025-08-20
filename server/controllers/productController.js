const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/productModel');

/**
 * @desc    Fetch all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;

  // Build filter object based on query parameters
  const filter = {};
  
  // Search by keyword (name or description)
  if (req.query.keyword) {
    filter.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } },
    ];
  }
  
  // Filter by category
  if (req.query.category && req.query.category !== 'all') {
    filter.category = req.query.category;
  }
  
  // Filter by brand
  if (req.query.brand && req.query.brand !== 'all') {
    filter.brand = req.query.brand;
  }
  
  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }
  
  // Filter by minimum rating
  if (req.query.rating) {
    filter.rating = { $gte: Number(req.query.rating) };
  }
  
  // Filter by stock availability
  if (req.query.inStock === 'true') {
    filter.inStock = true;
  }

  // Get count of products matching the filter
  const count = await Product.countDocuments(filter);

  // Get products with pagination
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder || -1 } : { createdAt: -1 });

  // Return products, pagination info, and available filters
  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count,
  });
});

/**
 * @desc    Fetch single product
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('relatedProducts', 'name images price rating');

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    images,
    brand,
    category,
    countInStock,
    features,
    specifications,
    tags,
    weight,
    dimensions,
    warranty,
    originalPrice,
  } = req.body;

  const product = new Product({
    name,
    price,
    description,
    images: images || ['https://via.placeholder.com/650x650'],
    brand,
    category,
    countInStock,
    inStock: countInStock > 0,
    features: features || [],
    specifications: specifications || {},
    tags: tags || [],
    weight,
    dimensions,
    warranty,
    originalPrice,
    user: req.user._id,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    images,
    brand,
    category,
    countInStock,
    features,
    specifications,
    tags,
    weight,
    dimensions,
    warranty,
    originalPrice,
    relatedProducts,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;
    product.images = images || product.images;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.inStock = countInStock > 0;
    product.features = features || product.features;
    product.specifications = specifications || product.specifications;
    product.tags = tags || product.tags;
    product.weight = weight || product.weight;
    product.dimensions = dimensions || product.dimensions;
    product.warranty = warranty || product.warranty;
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
    product.relatedProducts = relatedProducts || product.relatedProducts;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Create new review
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.username,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;
    
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Get top rated products
 * @route   GET /api/products/top
 * @access  Public
 */
const getTopProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  
  const products = await Product.find({})
    .sort({ rating: -1 })
    .limit(limit);

  res.json(products);
});

/**
 * @desc    Get product categories
 * @route   GET /api/products/categories
 * @access  Public
 */
const getProductCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});

/**
 * @desc    Get product brands
 * @route   GET /api/products/brands
 * @access  Public
 */
const getProductBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  res.json(brands);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductCategories,
  getProductBrands,
};
