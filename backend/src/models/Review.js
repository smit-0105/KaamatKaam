import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 1000 },
}, {
  timestamps: true,
});

// One review per reviewer per ride
reviewSchema.index({ reviewer: 1, ride: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

// Static method to recalculate user's average rating
reviewSchema.statics.calcAverageRating = async function (userId) {
  const stats = await this.aggregate([
    { $match: { reviewee: userId } },
    {
      $group: {
        _id: '$reviewee',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(userId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await mongoose.model('User').findByIdAndUpdate(userId, {
      avgRating: 0,
      totalReviews: 0,
    });
  }
};

// After save, recalculate average rating
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.reviewee);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
