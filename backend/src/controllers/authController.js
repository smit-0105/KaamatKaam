import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import AppError from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendEmail } from '../utils/email.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password, phoneNumber, gender, dateOfBirth } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('User already exists with this email', 400));
  }

  const user = await User.create({ name, email, password, phoneNumber, gender, dateOfBirth });

  // Send Welcome Email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to KaamatKaam! 🚗📦',
      html: `<h1>Welcome ${user.name}!</h1><p>We are thrilled to have you on board! You can now publish trips or send parcels across India seamlessly and securely.</p>`,
    });
  } catch (err) {
    console.error('Could not send welcome email', err);
  }

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.profilePhoto,
      token: generateToken(user._id),
    },
  });
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.profilePhoto,
      avgRating: user.avgRating,
      totalReviews: user.totalReviews,
      token: generateToken(user._id),
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: user });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'phoneNumber', 'bio', 'dateOfBirth', 'gender', 'vehicle', 'preferences'];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  // If profile photo was uploaded
  if (req.file) {
    updates.profilePhoto = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: user });
});

// @desc    Get public profile of any user
// @route   GET /api/auth/user/:id
// @access  Public
export const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    'name profilePhoto bio gender avgRating totalReviews totalRidesAsDriver totalRidesAsPassenger vehicle preferences isEmailVerified isPhoneVerified isIdVerified createdAt'
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({ success: true, data: user });
});

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No account with that email', 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // In production, send email with reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset. Please click the link below to securely reset your password:</p>
    <a href="${resetUrl}" target="_blank">Reset Password</a>
    <p>If you did not request this reset, please ignore this email.</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'KaamatKaam - Password Reset',
      html: message,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Email could not be sent', 500));
  }

  // For dev, just return the token
  res.json({
    success: true,
    message: 'Password reset link sent to email',
    // Remove resetUrl from production response
    resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    data: { token: generateToken(user._id) },
    message: 'Password reset successful',
  });
});