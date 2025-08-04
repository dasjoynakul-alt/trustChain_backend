import User from '../models/Users.js';
import logger from '../utils/logger.js';

const getTime = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: false, message: 'Email required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const sendTime = user.forgot_otp?.send_time;
    if (!sendTime) {
      return res.status(400).json({ status: false, message: 'OTP not sent' });
    }

    res.status(200).json({
      status: true,
      time: sendTime.getTime(),
    });
  } catch (error) {
    logger.error(`Get time error: ${error.message}`);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

export { getTime };