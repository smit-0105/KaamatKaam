import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  requestBooking, respondToBooking, cancelBooking,
  getMyBookings, getBookingsForRide, completeBooking,
} from '../controllers/bookingController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', requestBooking);
router.get('/my', getMyBookings);
router.get('/ride/:rideId', getBookingsForRide);
router.put('/:id/respond', respondToBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/complete', completeBooking);

export default router;
