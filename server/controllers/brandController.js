const asyncHandler = require('../middleware/asyncHandler');
const Brand = require('../models/brandModel');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
  res.json(brands);
});

// @desc    Get all brands (admin)
// @route   GET /api/brands/admin/all
// @access  Private/Admin
const getBrandsAdmin = asyncHandler(async (req, res) => {
  const brands = await Brand.find({}).sort({ name: 1 });
  res.json(brands);
});

// @desc    Get brand by ID
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (brand) {
    res.json(brand);
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = asyncHandler(async (req, res) => {
  const { name, description, image, isActive } = req.body;
  const brandExists = await Brand.findOne({ name });
  if (brandExists) {
    res.status(400);
    throw new Error('Brand already exists');
  }
  const brand = await Brand.create({ name, description, image, isActive });
  res.status(201).json(brand);
});

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (brand) {
    brand.name = req.body.name || brand.name;
    brand.description = req.body.description || brand.description;
    brand.image = req.body.image || brand.image;
    brand.isActive = req.body.isActive !== undefined ? req.body.isActive : brand.isActive;
    await brand.save();
    res.json(brand);
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (brand) {
    await brand.remove();
    res.json({ message: 'Brand removed' });
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

module.exports = {
  getBrands,
  getBrandsAdmin,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
};
