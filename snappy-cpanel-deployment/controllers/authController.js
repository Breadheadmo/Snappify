const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

/**
 * @desc    Request password reset
 * @route   POST /api/users/request-reset
 * @access  Public
 */
// const requestPasswordReset = asyncHandler(async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) {
//     res.status(404);
//     throw new Error('User not found');
//   }
//   // Generate token
//   const token = crypto.randomBytes(32).toString('hex');
//   user.resetToken = token;
//   user.resetTokenExpires = Date.now() + 3600000; // 1 hour
//   await user.save();
//   // Send email (replace with your SMTP config)
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
//   });
//   const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
//   await transporter.sendMail({
//     to: user.email,
//     subject: 'Password Reset',
//     html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
//   });
//   res.json({ message: 'Password reset email sent' });
// });

/**
 * @desc    Reset password
 * @route   POST /api/users/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findOne({ resetToken: req.params.token, resetTokenExpires: { $gt: Date.now() } });
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }
  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
});

/**
 * @desc    Email verification
 * @route   POST /api/users/send-verification
 * @access  Public
 */
// const sendEmailVerification = asyncHandler(async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) {
//     res.status(404);
//     throw new Error('User not found');
//   }
//   const token = crypto.randomBytes(32).toString('hex');
//   user.emailVerificationToken = token;
//   user.emailVerified = false;
//   await user.save();
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
//   });
//   const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
//   await transporter.sendMail({
//     to: user.email,
//     subject: 'Verify Your Email',
//     html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
//   });
//   res.json({ message: 'Verification email sent' });
// });

/**
 * @desc    Verify email
 * @route   POST /api/users/verify-email/:token
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ emailVerificationToken: req.params.token });
  if (!user) {
    res.status(400);
    throw new Error('Invalid token');
  }
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();
  res.json({ message: 'Email verified successfully' });
});

module.exports = {
  // requestPasswordReset,
  resetPassword,
  // sendEmailVerification,
  verifyEmail,
};
