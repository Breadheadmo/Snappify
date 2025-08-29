const express = require('express');
const router = express.Router();
const {
  requestPasswordReset,
  resetPassword,
  sendEmailVerification,
  verifyEmail,
} = require('../controllers/authController');

// Password reset
// router.post('/request-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

// Email verification
// router.post('/send-verification', sendEmailVerification);
router.post('/verify-email/:token', verifyEmail);

module.exports = router;
