import jwt from 'jsonwebtoken';
import User from '../models/Users.js';
import logger from '../utils/logger.js';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    logger.info(`Auth header: ${authHeader}`);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('No token provided in Authorization header');
      return res.status(401).json({ status: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      logger.warn('Invalid token format');
      return res.status(401).json({ status: false, message: 'Invalid token format' });
    }

    logger.info(`Verifying token: ${token.substring(0, 10)}...`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(`Decoded token: ${JSON.stringify(decoded)}`);
    if (!decoded.id) {
      logger.warn('Invalid token payload: missing id');
      return res.status(401).json({ status: false, message: 'Invalid token payload' });
    }

    const user = await User.findById(decoded.id).select('-password -forgot_otp');
    if (!user) {
      logger.warn(`User not found for id: ${decoded.id}`);
      return res.status(401).json({ status: false, message: 'User not found' });
    }

    req.user = { id: user._id.toString(), email: user.email };
    logger.info(`User authenticated: ${user.email}`);
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}, Token: ${req.headers.authorization?.substring(0, 20)}...`);
    return res.status(401).json({ status: false, message: 'Invalid or expired token' });
  }
};

export default auth;