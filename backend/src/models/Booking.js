import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weightBooked: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  totalPrice: { type: Number, required: true, min: 0 },

  // Optional pickup/dropoff at intermediate stops
  pickupStop: { type: String, default: '' },
  dropoffStop: { type: String, default: '' },

  parcelDescription: {
    type: String,
    trim: true,
    maxlength: 500
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
    default: 'pending',
  },

  // Who cancelled and why
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancellationReason: { type: String, default: '' },

  confirmedAt: { type: Date },
  completedAt: { type: Date },
}, {
  timestamps: true,
});

// Ensure a sender can only have one active booking per ride
bookingSchema.index({ ride: 1, sender: 1 }, { unique: true });
bookingSchema.index({ passenger: 1, status: 1 });
bookingSchema.index({ ride: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
