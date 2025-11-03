import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createDeliveryRequest,
  updateDeliveryRequestStatus,
  getMySentRequests,
  getMyReceivedRequests,
  getDeliveryRequestDetails,
} from '../controllers/deliveryRequestController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/').post(createDeliveryRequest);
router.route('/sent').get(getMySentRequests);
router.route('/received').get(getMyReceivedRequests);

router.route('/:id').get(getDeliveryRequestDetails);
router.route('/:id/status').put(updateDeliveryRequestStatus);

export default router;
