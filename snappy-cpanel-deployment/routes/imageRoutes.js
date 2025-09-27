const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadProductImage } = require('../controllers/imageController');

// Upload product image
router.post('/:id/image', protect, admin, uploadProductImage);

module.exports = router;
