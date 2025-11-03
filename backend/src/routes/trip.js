import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createTrip,
  searchTrips,
  getTripById,
  getMyTrips,
  updateTrip
} from './controllers/tripController.js';

const router = express.Router();

// @route   /api/trips

router.route('/')
  .post(protect, createTrip)  // A logged-in user can create a trip
  .get(searchTrips);          // Anyone can search for trips

// @route   /api/trips/mytrips
router.route('/mytrips').get(protect, getMyTrips); // Get trips for the logged-in user

// @route   /api/trips/:id
router.route('/:id')
  .get(getTripById)           // Anyone can view a single trip
  .put(protect, updateTrip);  // Only the user who created the trip can update it

export default router;

