import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  phoneNumber: { type: String, required: [true, 'Phone number is required'], trim: true },
  profilePhoto: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 500 },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },

  // Vehicle details (for drivers)
  vehicle: {
    make: { type: String, default: '' },
    model: { type: String, default: '' },
    color: { type: String, default: '' },
    plateNumber: { type: String, default: '' },
    year: { type: Number },
  },

  // Ride preferences
  preferences: {
    smoking: { type: String, enum: ['no_preference', 'no_smoking', 'smoking_ok'], default: 'no_preference' },
    music: { type: String, enum: ['no_preference', 'silence', 'music_ok'], default: 'no_preference' },
    pets: { type: String, enum: ['no_preference', 'no_pets', 'pets_ok'], default: 'no_preference' },
    chattiness: { type: String, enum: ['no_preference', 'quiet', 'chatty'], default: 'no_preference' },
  },

  // Trust & ratings
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
    totalTripsDriven: {
      type: Number,
      default: 0
    },
    totalParcelsSent: {
      type: Number,
      default: 0
    },

  // Firebase integration
  firebaseUid: { type: String, default: '' },

  // Verification
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isIdVerified: { type: Boolean, default: false },

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

// Virtual: full verification level
userSchema.virtual('verificationLevel').get(function () {
  let level = 0;
  if (this.isEmailVerified) level++;
  if (this.isPhoneVerified) level++;
  if (this.isIdVerified) level++;
  return level;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);
export default User;
