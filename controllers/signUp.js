import User from '../models/Users.js';
import TempUser from '../models/TempUser.js';
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcryptjs';
import { generateOTP } from '../utils/otpGenerator.js';
import logger from '../utils/logger.js';

const signUp = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ status: false, message: 'All fields are required' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        status: false,
        message: 'User already registered. Please log in.',
      });
    }

    await TempUser.deleteOne({ email: normalizedEmail });

    const newOTP = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    const tempUser = new TempUser({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      otp: newOTP,
    });
    await tempUser.save();

    try {
      await sendEmail({
        email: normalizedEmail,
        type: 'register',
        otp: newOTP,
      });
      res.status(200).json({
        status: true,
        message: 'OTP sent to your email. Please verify.',
        email: normalizedEmail,
      });
    } catch (emailError) {
      logger.error(`Email sending failed: ${emailError.message}`);
      res.status(500).json({
        status: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }
  } catch (error) {
    logger.error(`SignUp error: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Internal server error during registration.',
    });
  }
};

export { signUp };