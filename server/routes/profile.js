const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Order } = require('../models/Order');

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
router.put('/update', async (req, res) => {
  const { username, email } = req.body;
  const userId = req.user.id;

  try {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    const emailExists = users.some(u => u.id !== userId && u.email === email);
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    user.username = username || user.username;
    user.email = email || user.email;

    res.json({ message: 'Profile updated successfully', user: { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      profilePicture: user.profilePicture 
    }});
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Upload profile picture
router.post('/upload-picture', upload.single('profilePicture'), (req, res) => {
  const userId = req.user.id;

  try {
    const user = users.find(u => u.id === userId);
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
    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

// Get user orders
router.get('/orders', (req, res) => {
  try {
    const userOrders = Order.findByUserId(req.user.id);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update account settings
router.put('/settings', (req, res) => {
  const { notifications, language, currency } = req.body;
  const userId = req.user.id;

  try {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.settings = {
      ...user.settings,
      notifications: notifications ?? user.settings?.notifications,
      language: language ?? user.settings?.language,
      currency: currency ?? user.settings?.currency
    };

    res.json({ 
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
});

module.exports = router;
