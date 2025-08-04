import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  googleId: { type: String },
  isVerified: { type: Boolean, default: false },
  forgot_otp: {
    otp: String,
    send_time: Date,
  },
  mobile: { type: String, trim: true },
  address: {
    street: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    postalCode: { type: String, trim: true },
  },
  profilePic: { type: String, trim: true }, // Cloudinary URL for profile picture
  kycStatus: { type: String, default: 'unverified', enum: ['unverified', 'pending', 'verified'] },
});

const User = mongoose.model('User', userSchema);
export default User;