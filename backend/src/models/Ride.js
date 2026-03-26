import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
  city: { type: String, required: true, trim: true },
  address: { type: String, default: '', trim: true },
  priceFromOrigin: { type: Number, default: 0 },
  order: { type: Number, required: true },
}, { _id: true });

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Route
  origin: {
    city: { type: String, required: [true, 'Origin city is required'], trim: true },
    address: { type: String, default: '', trim: true },
  },
  destination: {
    city: { type: String, required: [true, 'Destination city is required'], trim: true },
    address: { type: String, default: '', trim: true },
  },
  stops: [stopSchema],

  // Schedule
  departureDate: { type: Date, required: [true, 'Departure date is required'] },
  departureTime: { type: String, required: [true, 'Departure time is required'] }, // "14:30" format
  estimatedDuration: { type: Number }, // in minutes

  // Weight & pricing
  availableWeightCapacity: {
    type: Number,
    min: 0
  },
  totalWeightCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerKg: {
    type: Number,
    required: true,
    min: 0
  },

  // Vehicle for this ride (snapshot from user profile or custom)
  vehicle: {
    make: { type: String, default: '' },
    model: { type: String, default: '' },
    color: { type: String, default: '' },
  },

  // Parcel preferences for this ride
  acceptedItemTypes: {
    type: [String],
    enum: ['Documents', 'Electronics', 'Clothing', 'Fragile', 'Heavy', 'General'],
    default: ['General']
  },
  maxDetour: { type: Number, default: 0 }, // km of detour allowed

  description: { type: String, default: '', maxlength: 1000 },
  isInstantBooking: { type: Boolean, default: false },
  isRecurring: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
}, {
  timestamps: true,
});

// Indexes for search performance
rideSchema.index({ 'origin.city': 1, 'destination.city': 1, departureDate: 1 });
rideSchema.index({ driver: 1, status: 1 });
rideSchema.index({ departureDate: 1, status: 1 });

// Calculate availableWeightCapacity before validating
rideSchema.pre('validate', function(next) {
  if (this.isNew && this.availableWeightCapacity === undefined) {
    this.availableWeightCapacity = this.totalWeightCapacity;
  }
  next();
});

// Virtual: is the ride full?
rideSchema.virtual('isFull').get(function () {
  return this.availableWeightCapacity <= 0;
});

rideSchema.set('toJSON', { virtuals: true });
rideSchema.set('toObject', { virtuals: true });

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;
