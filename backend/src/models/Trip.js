import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['ongoing', 'completed', 'cancelled'], default: 'ongoing' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
}, {
  timestamps: true,
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;