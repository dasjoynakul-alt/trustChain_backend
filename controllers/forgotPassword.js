import User from '../models/Users.js';
import sendEmail from '../utils/sendEmail.js';
import { generateOTP } from '../utils/otpGenerator.js';
import logger from '../utils/logger.js';

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, message: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.forgot_otp = {
      otp,
      send_time: otpExpiry,
    };
    await user.save();

    await sendEmail({
      email,
      type: 'forgot',
      otp,
    });

    res.status(200).json({
      status: true,
      message: 'OTP sent to your email. Please verify.',
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    next(error);
  }
};

export { forgotPassword };