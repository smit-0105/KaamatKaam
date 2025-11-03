import DeliveryRequest from '../models/DeliveryRequest.js';
import Trip from '../models/Trip.js';
import User from './models/User.js';

// @desc    Create a delivery request for a trip
// @route   POST /api/requests
// @access  Private
export const createDeliveryRequest = async (req, res) => {
  try {
    const { tripId, receiverName, receiverAddress, receiverPhoneNumber, packageDescription, packageWeightKg } = req.body;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.traveler.toString() === req.user.id) return res.status(400).json({ message: 'You cannot send a package on your own trip.' });

    const request = new DeliveryRequest({
      sender: req.user.id,
      trip: tripId,
      receiverName,
      receiverAddress,
      receiverPhoneNumber,
      packageDescription,
      packageWeightKg,
    });
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a delivery request status (approve/reject/etc.)
// @route   PUT /api/requests/:id/status
// @access  Private
export const updateDeliveryRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await DeliveryRequest.findById(req.params.id).populate('trip');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only the traveler of the trip can approve/reject
    if (request.trip.traveler.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this request' });
    }

    request.status = status;
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all requests made by the logged-in sender
// @route   GET /api/requests/sent
// @access  Private
export const getMySentRequests = async (req, res) => {
  try {
    const requests = await DeliveryRequest.find({ sender: req.user.id }).populate({
        path: 'trip',
        populate: { path: 'traveler', select: 'name' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all incoming requests for a traveler's trips
// @route   GET /api/requests/received
// @access  Private
export const getMyReceivedRequests = async (req, res) => {
    try {
        const myTrips = await Trip.find({ traveler: req.user.id }).select('_id');
        const tripIds = myTrips.map(t => t._id);
        const requests = await DeliveryRequest.find({ trip: { $in: tripIds } }).populate('sender', 'name');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get details of a request, with sensitive info based on status
// @route   GET /api/requests/:id
// @access  Private
export const getDeliveryRequestDetails = async (req, res) => {
    try {
        const request = await DeliveryRequest.findById(req.params.id)
            .populate('sender', 'name')
            .populate('trip');

        if (!request) return res.status(404).json({ message: 'Request not found' });

        const isSender = request.sender._id.toString() === req.user.id;
        const isTraveler = request.trip.traveler.toString() === req.user.id;

        if (!isSender && !isTraveler) return res.status(401).json({ message: 'Not authorized' });
        
        // **This is the key security feature**
        // Only return traveler/receiver contact details if the request is approved
        if (request.status === 'approved' || request.status === 'picked_up' || request.status === 'delivered') {
            const traveler = await User.findById(request.trip.traveler).select('name phoneNumber');
            return res.json({ ...request.toObject(), travelerDetails: traveler });
        }

        // If not approved, return the request without sensitive details
        const publicRequest = request.toObject();
        delete publicRequest.receiverPhoneNumber; // Hide phone number
        res.json(publicRequest);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
