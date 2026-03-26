import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import AppError from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Create a review for a user after a completed ride
// @route   POST /api/reviews
// @access  Private
export const createReview = catchAsync(async (req, res, next) => {
  const { rideId, revieweeId, rating, comment } = req.body;

  // Verify the reviewer was part of this ride (as sender or driver)
  const booking = await Booking.findOne({
    ride: rideId,
    status: 'completed',
    $or: [
      { sender: req.user.id },
    ],
  }).populate('ride');

  const isSender = booking !== null;
  let isDriver = false;

  if (!isSender) {
    const driverBooking = await Booking.findOne({
      ride: rideId,
      status: 'completed',
    }).populate('ride');

    if (driverBooking && driverBooking.ride.driver.toString() === req.user.id) {
      isDriver = true;
    }
  }

  if (!isSender && !isDriver) {
    return next(new AppError('You can only review users after a completed trip together', 400));
  }

  // Can't review yourself
  if (revieweeId === req.user.id) {
    return next(new AppError('You cannot review yourself', 400));
  }

  try {
    const review = await Review.create({
      ride: rideId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      rating,
      comment: comment || '',
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name profilePhoto')
      .populate('reviewee', 'name profilePhoto');

    res.status(201).json({ success: true, data: populatedReview });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('You have already reviewed this user for this trip', 400));
    }
    throw error;
  }
});

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getReviewsForUser = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name profilePhoto')
      .populate('ride', 'origin destination departureDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments({ reviewee: req.params.userId }),
  ]);

  res.json({
    success: true,
    data: reviews,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});
