const asyncHandler = require('../middleware/asyncHandler');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parent', 'name slug')
    .sort({ sortOrder: 1, name: 1 });
  
  res.json(categories);
});

/**
 * @desc    Get all categories (including inactive) for admin
 * @route   GET /api/categories/admin
 * @access  Private/Admin
 */
const getCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find({})
    .populate('parent', 'name slug')
    .sort({ sortOrder: 1, name: 1 });
  
  res.json(categories);
});

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parent', 'name slug');

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    image,
    parent,
    isActive,
    sortOrder,
    seoTitle,
    seoDescription,
    slug,
  } = req.body;

  // Always auto-generate slug from name if not provided
  let categorySlug = slug;
  if (!categorySlug && name) {
    categorySlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  if (!categorySlug) {
    return res.status(400).json({ message: 'Category name is required to generate slug.' });
  }

  // Check if category already exists
  const categoryExists = await Category.findOne({ name: name.trim() });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = new Category({
    name: name.trim(),
    slug: categorySlug,
    description,
    image,
    parent: parent || null,
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: sortOrder || 0,
    seoTitle,
    seoDescription,
  });

  const createdCategory = await category.save();
  
  // Populate parent for response
  await createdCategory.populate('parent', 'name slug');
  
  res.status(201).json(createdCategory);
});

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    image,
    parent,
    isActive,
    sortOrder,
    seoTitle,
    seoDescription,
  } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    // Check if name is being changed and if new name already exists
    if (name && name.trim() !== category.name) {
      const nameExists = await Category.findOne({ 
        name: name.trim(),
        _id: { $ne: category._id }
      });
      
      if (nameExists) {
        res.status(400);
        throw new Error('Category name already exists');
      }
    }

    category.name = name ? name.trim() : category.name;
    category.description = description || category.description;
    category.image = image || category.image;
    category.parent = parent !== undefined ? parent : category.parent;
    category.isActive = isActive !== undefined ? isActive : category.isActive;
    category.sortOrder = sortOrder !== undefined ? sortOrder : category.sortOrder;
    category.seoTitle = seoTitle || category.seoTitle;
    category.seoDescription = seoDescription || category.seoDescription;

    const updatedCategory = await category.save();
    await updatedCategory.populate('parent', 'name slug');
    
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    // Check if category has products
    const productsCount = await Product.countDocuments({ category: category.name });
    
    if (productsCount > 0) {
      res.status(400);
      throw new Error(`Cannot delete category. It has ${productsCount} products. Move or delete products first.`);
    }

    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({ parent: category._id });
    
    if (subcategoriesCount > 0) {
      res.status(400);
      throw new Error(`Cannot delete category. It has ${subcategoriesCount} subcategories. Delete subcategories first.`);
    }

    await category.deleteOne();
    res.json({ message: 'Category removed successfully' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

/**
 * @desc    Get category tree (hierarchical structure)
 * @route   GET /api/categories/tree
 * @access  Public
 */
const getCategoryTree = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parent', 'name slug')
    .sort({ sortOrder: 1, name: 1 });

  // Build tree structure
  const categoryMap = {};
  const tree = [];

  // First pass: create map
  categories.forEach(category => {
    categoryMap[category._id] = {
      ...category.toObject(),
      children: []
    };
  });

  // Second pass: build tree
  categories.forEach(category => {
    if (category.parent) {
      if (categoryMap[category.parent._id]) {
        categoryMap[category.parent._id].children.push(categoryMap[category._id]);
      }
    } else {
      tree.push(categoryMap[category._id]);
    }
  });

  res.json(tree);
});

/**
 * @desc    Update product counts for all categories
 * @route   PUT /api/categories/update-counts
 * @access  Private/Admin
 */
const updateCategoryCounts = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  
  for (const category of categories) {
    const productCount = await Product.countDocuments({ category: category.name });
    category.productCount = productCount;
    await category.save();
  }
  
  res.json({ message: 'Category product counts updated successfully' });
});

module.exports = {
  getCategories,
  getCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  updateCategoryCounts,
};
    createCategory
