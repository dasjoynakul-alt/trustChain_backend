import User from '../models/Users.js';
import logger from '../utils/logger.js';

const forgotOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ status: false, message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, message: 'User not found' });
    }

    const otpField = user.forgot_otp?.otp;
    const sendTime = user.forgot_otp?.send_time;

    if (!otpField || !sendTime) {
      return res.status(400).json({ status: false, message: 'No OTP record found' });
    }

    if (new Date() > sendTime) {
      return res.status(400).json({ status: false, message: 'OTP expired' });
    }

    if (otpField !== otp) {
      return res.status(400).json({ status: false, message: 'Invalid OTP' });
    }

    user.forgot_otp = undefined;
    await user.save();

    res.status(200).json({
      status: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    logger.error(`Forgot OTP error: ${error.message}`);
    next(error);
  }
};

export { forgotOtp };