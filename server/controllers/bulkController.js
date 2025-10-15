const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/bulk');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

/**
 * @desc    Export products to CSV
 * @route   GET /api/bulk/export
 * @access  Private/Admin
 */
const exportProducts = asyncHandler(async (req, res) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
  } = req.query;

  // Build filter
  let filter = {};
  
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (inStock === 'true') filter.countInStock = { $gt: 0 };
  if (inStock === 'false') filter.countInStock = 0;

  const products = await Product.find(filter).populate('category', 'name');

  if (products.length === 0) {
    res.status(404);
    throw new Error('No products found matching the criteria');
  }

  // Prepare CSV data
  const csvData = products.map(product => ({
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    brand: product.brand || '',
    category: product.category,
    price: product.price,
    countInStock: product.countInStock,
    sku: product.sku || '',
    rating: product.rating,
    numReviews: product.numReviews,
    features: product.features ? product.features.join(';') : '',
    tags: product.tags ? product.tags.join(';') : '',
    weight: product.weight || '',
    dimensions: product.dimensions || '',
    material: product.material || '',
    color: product.color || '',
    size: product.size || '',
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    seoTitle: product.seo?.title || '',
    seoDescription: product.seo?.description || '',
    seoKeywords: product.seo?.keywords ? product.seo.keywords.join(';') : '',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));

  // Create CSV file
  const fileName = `products-export-${Date.now()}.csv`;
  const filePath = path.join(__dirname, '../uploads/bulk', fileName);

  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'description', title: 'Description' },
      { id: 'brand', title: 'Brand' },
      { id: 'category', title: 'Category' },
      { id: 'price', title: 'Price' },
      { id: 'countInStock', title: 'Stock Count' },
      { id: 'sku', title: 'SKU' },
      { id: 'rating', title: 'Rating' },
      { id: 'numReviews', title: 'Number of Reviews' },
      { id: 'features', title: 'Features' },
      { id: 'tags', title: 'Tags' },
      { id: 'weight', title: 'Weight' },
      { id: 'dimensions', title: 'Dimensions' },
      { id: 'material', title: 'Material' },
      { id: 'color', title: 'Color' },
      { id: 'size', title: 'Size' },
      { id: 'isActive', title: 'Is Active' },
      { id: 'isFeatured', title: 'Is Featured' },
      { id: 'seoTitle', title: 'SEO Title' },
      { id: 'seoDescription', title: 'SEO Description' },
      { id: 'seoKeywords', title: 'SEO Keywords' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'updatedAt', title: 'Updated At' },
    ]
  });

  await csvWriter.writeRecords(csvData);

  // Send file as download
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
    }
    // Delete file after download
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
    });
  });
});

/**
 * @desc    Import products from CSV
 * @route   POST /api/bulk/import
 * @access  Private/Admin
 */
const importProducts = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const filePath = req.file.path;
  const results = [];
  const errors = [];
  let lineNumber = 1;

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (data) => {
        lineNumber++;
        try {
          // Validate required fields
          if (!data.name || !data.price) {
            errors.push({
              line: lineNumber,
              error: 'Name and price are required fields'
            });
            return;
          }

          // Prepare product data
          const productData = {
            name: data.name.trim(),
            description: data.description || '',
            brand: data.brand || '',
            category: data.category || 'General',
            price: Number(data.price),
            countInStock: Number(data.countInStock) || 0,
            sku: data.sku || '',
            features: data.features ? data.features.split(';').map(f => f.trim()) : [],
            tags: data.tags ? data.tags.split(';').map(t => t.trim()) : [],
            weight: data.weight || '',
            dimensions: data.dimensions || '',
            material: data.material || '',
            color: data.color || '',
            size: data.size || '',
            isActive: data.isActive === 'true' || data.isActive === true,
            isFeatured: data.isFeatured === 'true' || data.isFeatured === true,
          };

          // Add SEO data if provided
          if (data.seoTitle || data.seoDescription || data.seoKeywords) {
            productData.seo = {
              title: data.seoTitle || '',
              description: data.seoDescription || '',
              keywords: data.seoKeywords ? data.seoKeywords.split(';').map(k => k.trim()) : [],
            };
          }

          // Check if updating existing product
          if (data.id) {
            const existingProduct = await Product.findById(data.id);
            if (existingProduct) {
              await Product.findByIdAndUpdate(data.id, productData);
              results.push({
                line: lineNumber,
                action: 'updated',
                product: data.name,
                id: data.id
              });
            } else {
              errors.push({
                line: lineNumber,
                error: `Product with ID ${data.id} not found`
              });
            }
          } else {
            // Create new product
            const newProduct = await Product.create(productData);
            results.push({
              line: lineNumber,
              action: 'created',
              product: data.name,
              id: newProduct._id
            });
          }

        } catch (error) {
          errors.push({
            line: lineNumber,
            error: error.message
          });
        }
      })
      .on('end', () => {
        // Delete uploaded file
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });

        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  }).then(() => {
    res.json({
      message: 'Import completed',
      totalProcessed: results.length + errors.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    });
  }).catch((error) => {
    res.status(500);
    throw new Error(`Import failed: ${error.message}`);
  });
});

/**
 * @desc    Get CSV template for import
 * @route   GET /api/bulk/template
 * @access  Private/Admin
 */
const getImportTemplate = asyncHandler(async (req, res) => {
  const templateData = [{
    id: '', // Leave empty for new products
    name: 'Sample Product Name',
    description: 'Sample product description',
    brand: 'Sample Brand',
    category: 'Electronics',
    price: '99.99',
    countInStock: '50',
    sku: 'SKU-001',
    features: 'Feature 1;Feature 2;Feature 3',
    tags: 'tag1;tag2;tag3',
    weight: '1.5kg',
    dimensions: '10x10x5cm',
    material: 'Plastic',
    color: 'Black',
    size: 'Medium',
    isActive: 'true',
    isFeatured: 'false',
    seoTitle: 'Sample SEO Title',
    seoDescription: 'Sample SEO Description',
    seoKeywords: 'keyword1;keyword2;keyword3',
  }];

  const fileName = `product-import-template-${Date.now()}.csv`;
  const filePath = path.join(__dirname, '../uploads/bulk', fileName);

  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'description', title: 'Description' },
      { id: 'brand', title: 'Brand' },
      { id: 'category', title: 'Category' },
      { id: 'price', title: 'Price' },
      { id: 'countInStock', title: 'Stock Count' },
      { id: 'sku', title: 'SKU' },
      { id: 'features', title: 'Features' },
      { id: 'tags', title: 'Tags' },
      { id: 'weight', title: 'Weight' },
      { id: 'dimensions', title: 'Dimensions' },
      { id: 'material', title: 'Material' },
      { id: 'color', title: 'Color' },
      { id: 'size', title: 'Size' },
      { id: 'isActive', title: 'Is Active' },
      { id: 'isFeatured', title: 'Is Featured' },
      { id: 'seoTitle', title: 'SEO Title' },
      { id: 'seoDescription', title: 'SEO Description' },
      { id: 'seoKeywords', title: 'SEO Keywords' },
    ]
  });

  await csvWriter.writeRecords(templateData);

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Error downloading template:', err);
    }
    // Delete file after download
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error('Error deleting temp template file:', unlinkErr);
    });
  });
});

/**
 * @desc    Bulk update products
 * @route   PUT /api/bulk/update
 * @access  Private/Admin
 */
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { productIds, updates } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(400);
    throw new Error('Product IDs array is required');
  }

  if (!updates || Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error('Updates object is required');
  }

  // Validate updates object
  const allowedUpdates = [
    'category', 'brand', 'isActive', 'isFeatured', 'tags'
  ];
  
  const updateKeys = Object.keys(updates);
  const invalidKeys = updateKeys.filter(key => !allowedUpdates.includes(key));
  
  if (invalidKeys.length > 0) {
    res.status(400);
    throw new Error(`Invalid update fields: ${invalidKeys.join(', ')}`);
  }

  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    { $set: updates }
  );

  res.json({
    message: `${result.modifiedCount} products updated successfully`,
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  });
});

/**
 * @desc    Bulk delete products
 * @route   DELETE /api/bulk/delete
 * @access  Private/Admin
 */
const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(400);
    throw new Error('Product IDs array is required');
  }

  const result = await Product.deleteMany({ _id: { $in: productIds } });

  res.json({
    message: `${result.deletedCount} products deleted successfully`,
    deletedCount: result.deletedCount,
  });
});

module.exports = {
  exportProducts,
  importProducts,
  getImportTemplate,
  bulkUpdateProducts,
  bulkDeleteProducts,
  upload, // Export multer middleware
};