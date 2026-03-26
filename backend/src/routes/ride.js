import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  publishRide, searchRides, getRideById,
  getMyPublishedRides, updateRide, cancelRide, getRidePassengers,
} from '../controllers/rideController.js';
import { rideValidator } from '../utils/validators.js';

const router = express.Router();

// Public
router.get('/', searchRides);
router.get('/:id', getRideById);

// Protected
router.post('/', protect, rideValidator, publishRide);
router.get('/driver/myrides', protect, getMyPublishedRides);
router.put('/:id', protect, updateRide);
router.delete('/:id', protect, cancelRide);
router.get('/:id/passengers', protect, getRidePassengers);

export default router;
