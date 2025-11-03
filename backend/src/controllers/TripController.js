import Trip from '../models/Trip.js';

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req, res) => {
  try {
    const { origin, destination, departureTime, estimatedArrivalTime, capacityKg, pricePerKg } = req.body;
    const trip = new Trip({
      traveler: req.user.id,
      origin,
      destination,
      departureTime,
      estimatedArrivalTime,
      capacityKg,
      pricePerKg,
    });
    const createdTrip = await trip.save();
    res.status(201).json(createdTrip);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Search for available trips
// @route   GET /api/trips
// @access  Public
export const searchTrips = async (req, res) => {
  try {
    const { origin, destination } = req.query;
    const query = { status: 'upcoming' };

    // Use case-insensitive regex for flexible searching
    if (origin) query.origin = { $regex: origin, $options: 'i' };
    if (destination) query.destination = { $regex: destination, $options: 'i' };

    const trips = await Trip.find(query).populate('traveler', 'name');
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get a single trip by ID
// @route   GET /api/trips/:id
// @access  Public
export const getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id).populate('traveler', 'name');
        if (trip) {
            res.json(trip);
        } else {
            res.status(404).json({ message: 'Trip not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all trips posted by the logged-in user
// @route   GET /api/trips/mytrips
// @access  Private
export const getMyTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ traveler: req.user.id });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a trip posted by the user
// @route   PUT /api/trips/:id
// @access  Private (Traveler only)
export const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Ensure the person updating the trip is the one who created it
    if (trip.traveler.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update the fields from the request body
    trip.origin = req.body.origin || trip.origin;
    trip.destination = req.body.destination || trip.destination;
    trip.departureTime = req.body.departureTime || trip.departureTime;
    trip.estimatedArrivalTime = req.body.estimatedArrivalTime || trip.estimatedArrivalTime;
    trip.capacityKg = req.body.capacityKg || trip.capacityKg;
    trip.pricePerKg = req.body.pricePerKg || trip.pricePerKg;
    trip.status = req.body.status || trip.status;

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

