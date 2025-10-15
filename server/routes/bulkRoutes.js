const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  exportProducts,
  importProducts,
  getImportTemplate,
  bulkUpdateProducts,
  bulkDeleteProducts,
  upload,
} = require('../controllers/bulkController');

// All bulk operations require admin authentication
router.use(protect, admin);

// Export products
router.route('/export')
  .get(exportProducts);

// Import products
router.route('/import')
  .post(upload.single('file'), importProducts);

// Get import template
router.route('/template')
  .get(getImportTemplate);

// Bulk update products
router.route('/update')
  .put(bulkUpdateProducts);

// Bulk delete products
router.route('/delete')
  .delete(bulkDeleteProducts);

module.exports = router;