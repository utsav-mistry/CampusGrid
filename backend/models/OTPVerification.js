import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['registration', 'login', 'password_reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-delete expired OTPs
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTPVerification = mongoose.model('OTPVerification', otpVerificationSchema);

export default OTPVerification;
