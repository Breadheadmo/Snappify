const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/profile-pictures';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, 'user-' + req.user.id + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Update profile
router.put('/update', protect, async (req, res) => {
  const { username, email } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;
    
    const updatedUser = await user.save();

    res.json({ 
      message: 'Profile updated successfully', 
      user: { 
        id: updatedUser._id, 
        username: updatedUser.username, 
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture 
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Change password
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await user.matchPassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Upload profile picture
router.post('/upload-picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      const oldPicturePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    user.profilePicture = '/uploads/profile-pictures/' + req.file.filename;
    await user.save();
    
    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

// Get user orders
router.get('/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update account settings
router.put('/settings', protect, async (req, res) => {
  const { notifications, language, currency } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize settings if they don't exist
    if (!user.settings) {
      user.settings = {};
    }

    user.settings = {
      ...user.settings,
      notifications: notifications !== undefined ? notifications : user.settings.notifications,
      language: language || user.settings.language,
      currency: currency || user.settings.currency
    };

    await user.save();

    res.json({ 
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

module.exports = router;
