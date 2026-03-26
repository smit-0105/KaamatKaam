import { body } from 'express-validator';

// Validation result middleware
import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validators
export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  validate,
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Ride validators
export const rideValidator = [
  body('origin.city').trim().notEmpty().withMessage('Origin city is required'),
  body('destination.city').trim().notEmpty().withMessage('Destination city is required'),
  body('departureDate').isISO8601().withMessage('Valid departure date is required'),
  body('departureTime').trim().notEmpty().withMessage('Departure time is required'),
  body('totalWeightCapacity').isFloat({ min: 1 }).withMessage('Weight capacity must be at least 1 kg'),
  body('pricePerKg').isFloat({ min: 0 }).withMessage('Price per kg must be a positive number'),
  validate,
];