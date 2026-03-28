import Ride from '../models/Ride.js';
import Booking from '../models/Booking.js';
import AppError from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Publish a new ride
// @route   POST /api/rides
// @access  Private
export const publishRide = catchAsync(async (req, res, next) => {
  const {
    transportMode, origin, destination, stops, departureDate, departureTime,
    estimatedDuration, totalWeightCapacity, pricePerKg, vehicle,
    acceptedItemTypes, description, isInstantBooking,
  } = req.body;

  const ride = await Ride.create({
    driver: req.user.id,
    transportMode: transportMode || 'Car',
    origin,
    destination,
    stops: stops || [],
    departureDate,
    departureTime,
    estimatedDuration,
    totalWeightCapacity: Number(totalWeightCapacity),
    availableWeightCapacity: Number(totalWeightCapacity),
    pricePerKg: Number(pricePerKg),
    vehicle: vehicle || req.user.vehicle || {},
    acceptedItemTypes: acceptedItemTypes || ['General'],
    description,
    isInstantBooking: isInstantBooking || false,
  });

  res.status(201).json({ success: true, data: ride });
});

// @desc    Search rides
// @route   GET /api/rides?origin=X&destination=Y&date=YYYY-MM-DD&weight=N
// @access  Public
export const searchRides = catchAsync(async (req, res, next) => {
  const { origin, destination, date, weight, minPrice, maxPrice, sortBy, page = 1, limit = 10 } = req.query;

  const query = { status: 'upcoming', availableWeightCapacity: { $gte: 1 } };

  if (origin) query['origin.city'] = { $regex: origin, $options: 'i' };
  if (destination) query['destination.city'] = { $regex: destination, $options: 'i' };

  if (date) {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    query.departureDate = { $gte: searchDate, $lt: nextDay };
  }

  if (weight) {
    query.availableWeightCapacity = { $gte: Number(weight) };
  }

  if (minPrice || maxPrice) {
    query.pricePerKg = {};
    if (minPrice) query.pricePerKg.$gte = Number(minPrice);
    if (maxPrice) query.pricePerKg.$lte = Number(maxPrice);
  }

  // Sort options
  let sort = { departureDate: 1, departureTime: 1 }; // default: earliest first
  if (sortBy === 'price_asc') sort = { pricePerKg: 1 };
  if (sortBy === 'price_desc') sort = { pricePerKg: -1 };
  if (sortBy === 'rating') sort = { 'driver.avgRating': -1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [rides, total] = await Promise.all([
    Ride.find(query)
      .populate('driver', 'name profilePhoto avgRating totalReviews totalTripsDriven')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Ride.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: rides,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
  });
});

// @desc    Get ride by ID
// @route   GET /api/rides/:id
// @access  Public
export const getRideById = catchAsync(async (req, res, next) => {
  const ride = await Ride.findById(req.params.id)
    .populate('driver', 'name profilePhoto bio avgRating totalReviews totalTripsDriven vehicle acceptedItemTypes isEmailVerified isPhoneVerified createdAt');

  if (!ride) {
    return next(new AppError('Ride not found', 404));
  }

  // Get confirmed passengers count
  const confirmedBookings = await Booking.countDocuments({ ride: ride._id, status: 'confirmed' });

  res.json({
    success: true,
    data: { ...ride.toObject(), confirmedBookings },
  });
});

// @desc    Get my published rides (as a driver)
// @route   GET /api/rides/myrides
// @access  Private
export const getMyPublishedRides = catchAsync(async (req, res, next) => {
  const { status } = req.query;
  const query = { driver: req.user.id };
  if (status) query.status = status;

  const rides = await Ride.find(query).sort({ departureDate: -1 });
  res.json({ success: true, data: rides });
});

// @desc    Update ride
// @route   PUT /api/rides/:id
// @access  Private (driver only)
export const updateRide = catchAsync(async (req, res, next) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) {
    return next(new AppError('Ride not found', 404));
  }
  if (ride.driver.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this ride', 403));
  }

  // Don't allow updates on completed/cancelled rides
  if (['completed', 'cancelled'].includes(ride.status)) {
    return next(new AppError('Cannot update a completed or cancelled ride', 400));
  }

  // Check for confirmed bookings — limited updates if bookings exist
  const confirmedBookings = await Booking.countDocuments({ ride: ride._id, status: 'confirmed' });

  const allowedFields = ['description', 'acceptedItemTypes', 'vehicle', 'status'];
  if (confirmedBookings === 0) {
    allowedFields.push('origin', 'destination', 'stops', 'departureDate', 'departureTime', 'estimatedDuration', 'totalWeightCapacity', 'pricePerKg', 'isInstantBooking');
  }

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      ride[field] = req.body[field];
    }
  }

  // Recalculate available capacity if totalWeightCapacity changed
  if (req.body.totalWeightCapacity !== undefined && confirmedBookings === 0) {
    ride.availableWeightCapacity = req.body.totalWeightCapacity;
  }

  const updatedRide = await ride.save();
  res.json({ success: true, data: updatedRide });
});

// @desc    Cancel ride
// @route   DELETE /api/rides/:id
// @access  Private (driver only)
export const cancelRide = catchAsync(async (req, res, next) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) {
    return next(new AppError('Ride not found', 404));
  }
  if (ride.driver.toString() !== req.user.id) {
    return next(new AppError('Not authorized to cancel this ride', 403));
  }

  ride.status = 'cancelled';
  await ride.save();

  // Auto-cancel all pending/confirmed bookings
  await Booking.updateMany(
    { ride: ride._id, status: { $in: ['pending', 'confirmed'] } },
    { status: 'cancelled', cancelledBy: req.user.id, cancellationReason: 'Ride cancelled by driver' }
  );

  res.json({ success: true, message: 'Ride cancelled successfully' });
});

// @desc    Get bookings for a ride
// @route   GET /api/rides/:id/passengers
// @access  Private (driver only)
export const getRidePassengers = catchAsync(async (req, res, next) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) {
    return next(new AppError('Ride not found', 404));
  }
  if (ride.driver.toString() !== req.user.id) {
    return next(new AppError('Not authorized', 403));
  }

  const bookings = await Booking.find({ ride: ride._id })
    .populate('sender', 'name profilePhoto phoneNumber avgRating')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
});
