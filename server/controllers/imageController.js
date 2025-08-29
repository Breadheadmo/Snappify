const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/productModel');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Upload product image
 * @route   POST /api/products/:id/image
 * @access  Private/Admin
 */
const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    res.status(400);
    throw new Error('No image file uploaded');
  }
  const imageFile = req.files.image;
  const uploadPath = path.join(__dirname, '../uploads/products', imageFile.name);
  await imageFile.mv(uploadPath);

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.images.push(`/uploads/products/${imageFile.name}`);
  await product.save();
  res.json({ message: 'Image uploaded', image: `/uploads/products/${imageFile.name}` });
});

module.exports = { uploadProductImage };
