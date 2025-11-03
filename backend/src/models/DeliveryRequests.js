import mongoose from 'mongoose';

const deliveryRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  receiverName: { type: String, required: true },
  receiverAddress: { type: String, required: true },
  receiverPhoneNumber: { type: String, required: true },
  packageDescription: { type: String, required: true },
  packageWeightKg: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const DeliveryRequest = mongoose.model('DeliveryRequest', deliveryRequestSchema);
export default DeliveryRequest;
