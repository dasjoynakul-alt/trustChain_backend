import User from '../models/Users.js';
import logger from '../utils/logger.js';

export const getUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      logger.warn('Unauthorized access attempt to getUser');
      return res.status(401).json({ status: false, message: 'Unauthorized: User not authenticated' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId).select('-password -forgot_otp');
    if (!user) {
      logger.warn(`User not found for id: ${userId}`);
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    logger.info(`User profile fetched for id: ${userId}`);
    return res.status(200).json({ status: true, user, message: 'User profile fetched successfully' });
  } catch (error) {
    logger.error(`Get user error: ${error.message}, UserId: ${req.user?.id}`);
    return res.status(500).json({ status: false, message: error.message || 'Failed to fetch user profile' });
  }
};