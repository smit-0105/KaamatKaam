import express from 'express';
import { protect } from '../middleware/auth.js';
import { registerUser, loginUser, getMe, updateProfile, getUserProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../utils/validators.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Public user profile
router.get('/user/:id', getUserProfile);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePhoto'), updateProfile);

export default router;