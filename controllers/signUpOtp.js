import User from '../models/Users.js';
import TempUser from '../models/TempUser.js';
import generateToken from '../utils/generateToken.js';
import logger from '../utils/logger.js';

const signUpOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ status: false, message: 'Email and OTP are required' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ status: false, message: 'User already verified. Please log in.' });
    }

    const tempUser = await TempUser.findOne({ email: normalizedEmail });
    if (!tempUser) {
      return res.status(400).json({ status: false, message: 'OTP expired or not found. Please request a new OTP.' });
    }

    if (tempUser.otp !== otp.trim()) {
      return res.status(400).json({ status: false, message: 'Invalid OTP' });
    }

    const user = new User({
      name: tempUser.name,
      email: normalizedEmail,
      password: tempUser.password,
      isVerified: true,
    });
    await user.save();

    await TempUser.deleteOne({ email: normalizedEmail });

    const token = generateToken(normalizedEmail);
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(200).json({
      status: true,
      message: 'Registration successful',
      token,
    });
  } catch (error) {
    logger.error(`OTP verification error: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Internal server error during OTP verification.',
    });
  }
};

export { signUpOtp };