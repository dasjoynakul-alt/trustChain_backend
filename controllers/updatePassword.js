import User from '../models/Users.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

const updatePassword = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: false, message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.forgot_otp = undefined;
    await user.save();

    res.status(200).json({ status: true, message: 'Password successfully updated' });
  } catch (error) {
    logger.error(`Update password error: ${error.message}`);
    next(error);
  }
};

export { updatePassword };