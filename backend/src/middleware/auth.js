import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import admin from '../config/firebase.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // If Firebase Auth is configured, verify Firebase token
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Link via email or firebaseUid (assuming Google/Firebase Auth guarantees email)
        const user = await User.findOne({ email: decodedToken.email });
        if (!user) return res.status(401).json({ success: false, message: 'Firebase User not synced with DB' });
        req.user = user;
      } else {
        // Fallback to old custom JWT logic
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Optional auth — attaches user if token provided, but doesn't block
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = await User.findOne({ email: decodedToken.email });
      } else {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (error) {
      // Token invalid, continue without user
    }
  }

  next();
};