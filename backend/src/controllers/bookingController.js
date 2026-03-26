import Booking from '../models/Booking.js';
import Ride from '../models/Ride.js';
import AppError from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendEmail } from '../utils/email.js';

// @desc    Request a booking on a ride
// @route   POST /api/bookings
// @access  Private
export const requestBooking = catchAsync(async (req, res, next) => {
  const { rideId, weightBooked = 1, pickupStop, dropoffStop, parcelDescription } = req.body;

  const ride = await Ride.findById(rideId);
  if (!ride) {
    return next(new AppError('Ride not found', 404));
  }

  // Can't book own ride
  if (ride.driver.toString() === req.user.id) {
    return next(new AppError('You cannot book your own ride', 400));
  }

  // Check ride status
  if (ride.status !== 'upcoming') {
    return next(new AppError('This trip is no longer available for booking', 400));
  }

  // Check weight availability
  if (ride.availableWeightCapacity < weightBooked) {
    return next(new AppError(`Only ${ride.availableWeightCapacity} kg of capacity available`, 400));
  }

  // Check for existing booking
  const existingBooking = await Booking.findOne({
    ride: rideId,
    sender: req.user.id,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (existingBooking) {
    return next(new AppError('You already have an active booking for this trip', 400));
  }

  const totalPrice = ride.pricePerKg * weightBooked;

  try {
    const booking = await Booking.create({
      ride: rideId,
      sender: req.user.id,
      weightBooked,
      totalPrice,
      pickupStop: pickupStop || '',
      dropoffStop: dropoffStop || '',
      parcelDescription: parcelDescription || '',
      status: ride.isInstantBooking ? 'confirmed' : 'pending',
      confirmedAt: ride.isInstantBooking ? new Date() : undefined,
    });

    // If instant booking, reduce available capacity immediately
    if (ride.isInstantBooking) {
      ride.availableWeightCapacity -= weightBooked;
      await ride.save();
      
      try {
        const senderData = await User.findById(req.user.id);
        await sendEmail({
          to: senderData.email,
          subject: 'KaamatKaam - Booking Confirmed! 📦',
          html: `<p>Your instant booking for ${weightBooked}kg on trip to ${ride.destination.city} is confirmed!</p>`
        });
      } catch(err) { console.error('Email failed', err); }
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('ride', 'origin destination departureDate departureTime pricePerKg')
      .populate('sender', 'name profilePhoto');

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('You already have a booking for this ride', 400));
    }
    next(error);
  }
});

// @desc    Respond to booking (accept/reject) — driver only
// @route   PUT /api/bookings/:id/respond
// @access  Private
export const respondToBooking = catchAsync(async (req, res, next) => {
  const { status } = req.body; // 'confirmed' or 'rejected'

  if (!['confirmed', 'rejected'].includes(status)) {
    return next(new AppError('Status must be confirmed or rejected', 400));
  }

  const booking = await Booking.findById(req.params.id).populate('ride');
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Only the ride driver can respond
  if (booking.ride.driver.toString() !== req.user.id) {
    return next(new AppError('Only the ride driver can respond to bookings', 403));
  }

  if (booking.status !== 'pending') {
    return next(new AppError('Booking is no longer pending', 400));
  }

  if (status === 'confirmed') {
    // Check weight availability
    const ride = await Ride.findById(booking.ride._id);
    if (ride.availableWeightCapacity < booking.weightBooked) {
      return next(new AppError('Not enough capacity available', 400));
    }

    ride.availableWeightCapacity -= booking.weightBooked;
    await ride.save();

    booking.status = 'confirmed';
    booking.confirmedAt = new Date();

    try {
      const dbSender = await User.findById(booking.sender._id || booking.sender);
      await sendEmail({
        to: dbSender.email,
        subject: 'KaamatKaam - Booking Accepted! ✅',
        html: `<p>The driver accepted your booking for ${booking.weightBooked}kg.</p>`
      });
    } catch(err) { console.error('Email failed', err); }
  } else {
    booking.status = 'rejected';
  }

  await booking.save();

  res.json({ success: true, data: booking });
});

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (passenger or driver)
export const cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('ride');
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  const isSender = booking.sender.toString() === req.user.id;
  const isDriver = booking.ride.driver.toString() === req.user.id;

  if (!isSender && !isDriver) {
    return next(new AppError('Not authorized to cancel this booking', 403));
  }

  if (!['pending', 'confirmed'].includes(booking.status)) {
    return next(new AppError('Booking cannot be cancelled at this stage', 400));
  }

  // Restore capacity if booking was confirmed
  if (booking.status === 'confirmed') {
    const ride = await Ride.findById(booking.ride._id);
    ride.availableWeightCapacity += booking.weightBooked;
    await ride.save();
  }

  booking.status = 'cancelled';
  booking.cancelledBy = req.user.id;
  booking.cancellationReason = req.body.reason || '';
  await booking.save();

  res.json({ success: true, message: 'Booking cancelled', data: booking });
});

// @desc    Get my bookings (as passenger)
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = catchAsync(async (req, res, next) => {
  const { status } = req.query;
  const query = { sender: req.user.id };
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .populate({
      path: 'ride',
      populate: { path: 'driver', select: 'name profilePhoto avgRating phoneNumber' },
    })
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
});

// @desc    Get all bookings for a ride (driver view)
// @route   GET /api/bookings/ride/:rideId
// @access  Private
export const getBookingsForRide = catchAsync(async (req, res, next) => {
  const ride = await Ride.findById(req.params.rideId);
  if (!ride) {
    return next(new AppError('Ride not found', 404));
  }
  if (ride.driver.toString() !== req.user.id) {
    return next(new AppError('Not authorized', 403));
  }

  const bookings = await Booking.find({ ride: req.params.rideId })
    .populate('sender', 'name profilePhoto avgRating phoneNumber')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
});

// @desc    Complete booking (after ride is done)
// @route   PUT /api/bookings/:id/complete
// @access  Private (driver)
export const completeBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('ride');
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.ride.driver.toString() !== req.user.id) {
    return next(new AppError('Only the driver can complete bookings', 403));
  }

  if (booking.status !== 'confirmed') {
    return next(new AppError('Only confirmed bookings can be completed', 400));
  }

  booking.status = 'completed';
  booking.completedAt = new Date();
  await booking.save();

  // Update ride counters
  const remainingConfirmed = await Booking.countDocuments({
    ride: booking.ride._id,
    status: 'confirmed',
  });

  if (remainingConfirmed === 0) {
    const ride = await Ride.findById(booking.ride._id);
    ride.status = 'completed';
    await ride.save();
  }

  res.json({ success: true, data: booking });
});
