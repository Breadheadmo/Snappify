const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/productModel');

/**
 * @desc    Fetch all products with advanced search and filtering
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  console.log('Get products called with query:', req.query);
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  // Build filter object based on query parameters
  const filter = { isActive: { $ne: false } }; // Only show active products
  
  // Search by keyword using text index
  if (req.query.search && req.query.search.trim()) {
    try {
      filter.$text = { $search: req.query.search.trim() };
      console.log('Using text search for:', req.query.search.trim());
    } catch (error) {
      console.log('Text search failed, falling back to regex search');
      // Fallback to regex search if text index fails
      const searchTerm = req.query.search.trim();
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      ];
    }
  }
  
  // Advanced keyword search (fallback if no text index)
  if (req.query.keyword && !req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } },
      { brand: { $regex: req.query.keyword, $options: 'i' } },
      { tags: { $in: [new RegExp(req.query.keyword, 'i')] } },
    ];
  }
  
  // Filter by category and subcategory
  if (req.query.category && req.query.category !== 'all') {
    filter.category = req.query.category;
  }
  
  if (req.query.subcategory && req.query.subcategory !== 'all') {
    filter.subcategory = req.query.subcategory;
  }
  
  // Filter by brand
  if (req.query.brand && req.query.brand !== 'all') {
    if (Array.isArray(req.query.brand)) {
      filter.brand = { $in: req.query.brand };
    } else {
      filter.brand = req.query.brand;
    }
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
    filter.countInStock = { $gt: 0 };
  }
  
  // Filter by features
  if (req.query.features) {
    const features = Array.isArray(req.query.features) 
      ? req.query.features 
      : req.query.features.split(',');
    filter.features = { $in: features.map(f => new RegExp(f, 'i')) };
  }
  
  // Filter by tags
  if (req.query.tags) {
    const tags = Array.isArray(req.query.tags) 
      ? req.query.tags 
      : req.query.tags.split(',');
    filter.tags = { $in: tags };
  }

  // Build sort object
  let sort = {};
  switch (req.query.sortBy) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'rating':
      sort = { rating: -1, numReviews: -1 };
      break;
    case 'popularity':
      sort = { purchaseCount: -1, viewCount: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'name':
      sort = { name: 1 };
      break;
    default:
      sort = { isFeatured: -1, createdAt: -1 };
  }

  // Add text score for text search
  if (req.query.search) {
    sort = { score: { $meta: 'textScore' }, ...sort };
  }

  console.log('Final filter object:', filter);
  console.log('Sort object:', sort);

  // Get count of products matching the filter
  const count = await Product.countDocuments(filter);
  console.log('Products count:', count);

  // Get products with pagination
  const products = await Product.find(filter)
    .select(req.query.search ? { score: { $meta: 'textScore' } } : {})
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(sort)
    .populate('relatedProducts', 'name images price rating');

  console.log('Found products:', products.length);

  // Get filter data for frontend
  const [brands, categories, priceRange] = await Promise.all([
    Product.distinct('brand', { isActive: { $ne: false } }),
    Product.distinct('category', { isActive: { $ne: false } }),
    Product.aggregate([
      { $match: { isActive: { $ne: false } } },
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }
    ])
  ]);

  // Return products, pagination info, and available filters
  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count,
    filters: {
      brands: brands.sort(),
      categories: categories.sort(),
      priceRange: priceRange[0] || { min: 0, max: 10000 }
    }
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
  let {
    name,
    price,
    description,
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

  // Parse specifications if sent as JSON string
  if (typeof specifications === 'string') {
    try {
      specifications = JSON.parse(specifications);
    } catch (err) {
      specifications = {};
    }
  }

  // Backend validation
  if (!category || typeof category !== 'string' || !category.trim()) {
    res.status(400);
    throw new Error('Category is required');
  }
  if (!brand || typeof brand !== 'string' || !brand.trim()) {
    res.status(400);
    throw new Error('Brand is required');
  }
  if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
    res.status(400);
    throw new Error('Valid price is required');
  }

  // Handle uploaded images: upload to Cloudinary
  let imagePaths = [];
  if (req.files && req.files.length > 0) {
    const uploadToCloudinary = require('../middleware/cloudinaryUpload');
    const cloudUploads = await Promise.all(
      req.files.map(file => uploadToCloudinary(file.path, file.filename))
    );
    imagePaths = cloudUploads;
  }
  // If no files, fallback to images from body or placeholder
  else if (req.body.images) {
    if (Array.isArray(req.body.images)) {
      imagePaths = req.body.images;
    } else if (typeof req.body.images === 'string') {
      imagePaths = [req.body.images];
    }
  } else {
    imagePaths = ['https://via.placeholder.com/650x650'];
  }

  const product = new Product({
    name,
    price,
    description,
    images: imagePaths,
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
  let {
    name,
    price,
    description,
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

  // Parse specifications if sent as JSON string
  if (typeof specifications === 'string') {
    try {
      specifications = JSON.parse(specifications);
    } catch (err) {
      specifications = {};
    }
  }

  const product = await Product.findById(req.params.id);

  // Backend validation
  if (category !== undefined && (typeof category !== 'string' || !category.trim())) {
    res.status(400);
    throw new Error('Category is required');
  }
  if (brand !== undefined && (typeof brand !== 'string' || !brand.trim())) {
    res.status(400);
    throw new Error('Brand is required');
  }
  if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
    res.status(400);
    throw new Error('Valid price is required');
  }

  // Handle uploaded images: upload to Cloudinary
  let imagePaths = product.images;
  
  // Handle existing images that should be kept
  if (req.body.existingImages) {
    try {
      const existingImages = JSON.parse(req.body.existingImages);
      imagePaths = existingImages;
    } catch (e) {
      imagePaths = [];
    }
  }
  
  // Handle new uploaded images
  if (req.files && req.files.length > 0) {
    const uploadToCloudinary = require('../middleware/cloudinaryUpload');
    const cloudUploads = await Promise.all(
      req.files.map(file => uploadToCloudinary(file.path, file.filename))
    );
    // Combine existing images with new uploads
    imagePaths = [...imagePaths, ...cloudUploads];
  } else if (req.body.images && !req.body.existingImages) {
    // Only use images from body if no existingImages parameter (backward compatibility)
    if (Array.isArray(req.body.images)) {
      imagePaths = req.body.images;
    } else if (typeof req.body.images === 'string') {
      imagePaths = [req.body.images];
    }
  }
  
  // Ensure we don't exceed 10 images
  if (imagePaths.length > 10) {
    imagePaths = imagePaths.slice(0, 10);
  }

  if (product) {
    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;
    product.images = imagePaths;
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
  const { rating, comment, title } = req.body;

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Rating and comment are required');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user has already reviewed this product
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  // Check if user has purchased this product (optional verification)
  // const Order = require('../models/orderModel');
  // const hasPurchased = await Order.findOne({
  //   user: req.user._id,
  //   'orderItems.product': req.params.id,
  //   isPaid: true
  // });

  const review = {
    name: req.user.username,
    rating: Number(rating),
    comment,
    title: title || '',
    user: req.user._id,
    helpful: 0,
    verified: false, // Set to true if user has purchased
  };

  product.reviews.push(review);

  // Update product rating and review count
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save();
  
  res.status(201).json({ 
    message: 'Review added successfully',
    review: product.reviews[product.reviews.length - 1]
  });
});

/**
 * @desc    Update a review
 * @route   PUT /api/products/:id/reviews/:reviewId
 * @access  Private
 */
const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, title } = req.body;
  const { id: productId, reviewId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns this review
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }

  // Update review
  if (rating) review.rating = Number(rating);
  if (comment) review.comment = comment;
  if (title !== undefined) review.title = title;

  // Recalculate product rating
  product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save();
  
  res.json({ 
    message: 'Review updated successfully',
    review 
  });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/products/:id/reviews/:reviewId
 * @access  Private
 */
const deleteProductReview = asyncHandler(async (req, res) => {
  const { id: productId, reviewId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns this review or is admin
  if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  product.reviews.pull(reviewId);

  // Recalculate product rating and review count
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.length > 0 
    ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length 
    : 0;

  await product.save();
  
  res.json({ message: 'Review deleted successfully' });
});

/**
 * @desc    Mark review as helpful
 * @route   PUT /api/products/:id/reviews/:reviewId/helpful
 * @access  Private
 */
const markReviewHelpful = asyncHandler(async (req, res) => {
  const { id: productId, reviewId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.helpful += 1;
  await product.save();
  
  res.json({ 
    message: 'Review marked as helpful',
    helpful: review.helpful 
  });
});

/**
 * @desc    Get product reviews with pagination
 * @route   GET /api/products/:id/reviews
 * @access  Public
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const sortBy = req.query.sortBy || 'newest'; // newest, oldest, rating_high, rating_low, helpful

  const product = await Product.findById(req.params.id)
    .populate('reviews.user', 'username');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let reviews = [...product.reviews];

  // Sort reviews
  switch (sortBy) {
    case 'oldest':
      reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'rating_high':
      reviews.sort((a, b) => b.rating - a.rating);
      break;
    case 'rating_low':
      reviews.sort((a, b) => a.rating - b.rating);
      break;
    case 'helpful':
      reviews.sort((a, b) => b.helpful - a.helpful);
      break;
    default: // newest
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;
  const paginatedReviews = reviews.slice(startIndex, endIndex);

  res.json({
    reviews: paginatedReviews,
    page,
    pages: Math.ceil(reviews.length / pageSize),
    totalReviews: reviews.length,
    averageRating: product.rating,
  });
});

/**
 * @desc    Add product variant
 * @route   POST /api/products/:id/variants
 * @access  Private/Admin
 */
const addProductVariant = asyncHandler(async (req, res) => {
  const { size, color, material, style, price, countInStock, sku, images } = req.body;

  if (!size && !color && !material && !style) {
    res.status(400);
    throw new Error('At least one variant attribute (size, color, material, or style) is required');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if variant with same attributes already exists
  const existingVariant = product.variants.find(variant => 
    variant.size === size &&
    variant.color === color &&
    variant.material === material &&
    variant.style === style
  );

  if (existingVariant) {
    res.status(400);
    throw new Error('Variant with these attributes already exists');
  }

  const newVariant = {
    size: size || '',
    color: color || '',
    material: material || '',
    style: style || '',
    price: price || product.price,
    countInStock: countInStock || 0,
    sku: sku || '',
    images: images || [],
  };

  product.variants.push(newVariant);
  await product.save();

  res.status(201).json({
    message: 'Variant added successfully',
    variant: product.variants[product.variants.length - 1]
  });
});

/**
 * @desc    Update product variant
 * @route   PUT /api/products/:id/variants/:variantId
 * @access  Private/Admin
 */
const updateProductVariant = asyncHandler(async (req, res) => {
  const { id: productId, variantId } = req.params;
  const { size, color, material, style, price, countInStock, sku, images } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const variant = product.variants.id(variantId);

  if (!variant) {
    res.status(404);
    throw new Error('Variant not found');
  }

  // Update variant fields
  if (size !== undefined) variant.size = size;
  if (color !== undefined) variant.color = color;
  if (material !== undefined) variant.material = material;
  if (style !== undefined) variant.style = style;
  if (price !== undefined) variant.price = price;
  if (countInStock !== undefined) variant.countInStock = countInStock;
  if (sku !== undefined) variant.sku = sku;
  if (images !== undefined) variant.images = images;

  await product.save();

  res.json({
    message: 'Variant updated successfully',
    variant
  });
});

/**
 * @desc    Delete product variant
 * @route   DELETE /api/products/:id/variants/:variantId
 * @access  Private/Admin
 */
const deleteProductVariant = asyncHandler(async (req, res) => {
  const { id: productId, variantId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const variant = product.variants.id(variantId);

  if (!variant) {
    res.status(404);
    throw new Error('Variant not found');
  }

  product.variants.pull(variantId);
  await product.save();

  res.json({ message: 'Variant deleted successfully' });
});

/**
 * @desc    Get product variants
 * @route   GET /api/products/:id/variants
 * @access  Public
 */
const getProductVariants = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('variants');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product.variants);
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
  // Get brands from existing products
  const existingBrands = await Product.distinct('brand');
  
  // Popular phone accessory brands
  const popularBrands = [
    // Major Tech Brands
    'Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Google', 'Sony', 'LG',
    
    // Audio Brands
    'Bose', 'JBL', 'Beats', 'Sennheiser', 'Audio-Technica', 'Skullcandy', 
    'Jabra', 'Plantronics', 'AKG', 'Marshall', 'Harman Kardon',
    
    // Charging & Power Brands
    'Anker', 'Belkin', 'RAVPower', 'Aukey', 'Mophie', 'Poweradd',
    'Baseus', 'Ugreen', 'Choetech', 'Spigen',
    
    // Protection & Cases
    'OtterBox', 'UAG', 'Case-Mate', 'Incipio', 'Tech21', 'Pelican', 
    'LifeProof', 'Catalyst', 'Peak Design', 'Nomad', 'Bellroy',
    
    // Screen Protection
    'ZAGG', 'amFilm', 'IQ Shield', 'ArmorSuit', 'Tech Armor', 'Maxboost', 'JETech',
    
    // Storage & Connectivity
    'SanDisk', 'Kingston', 'Lexar', 'Transcend', 'PNY', 'Corsair', 'ADATA',
    
    // Popular Budget Brands
    'Essager', 'INIU', 'Syncwire', 'Ailun', 'Mpow', 'TaoTronics', 'Bovon',
    
    // Local/Regional Brands
    'Volkano', 'Gizzu', 'Mecer', 'Proline', 'Laser', 'Digitech'
  ];
  
  // Combine existing brands with popular brands and remove duplicates
  const allBrands = [...new Set([...existingBrands, ...popularBrands])].sort();
  
  res.json(allBrands);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  markReviewHelpful,
  getProductReviews,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getProductVariants,
  getTopProducts,
  getProductCategories,
  getProductBrands,
};
