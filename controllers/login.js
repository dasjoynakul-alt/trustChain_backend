import bcrypt from 'bcryptjs';
import User from '../models/Users.js';
import generateToken from '../utils/generateToken.js';
import logger from '../utils/logger.js';

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Validate input
    if (!email || !password) {
      logger.warn('Login attempt with missing email or password');
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    // Find user by email
    const foundUser = await User.findOne({ email }).select('+password');
    if (!foundUser) {
      logger.warn(`No user found with email: ${email}`);
      const error = new Error('No user found with this email');
      error.statusCode = 400;
      throw error;
    }

    // Check password
    const isPassMatch = await bcrypt.compare(password, foundUser.password);
    if (!isPassMatch) {
      logger.warn(`Incorrect password for email: ${email}`);
      const error = new Error('Incorrect password');
      error.statusCode = 400;
      throw error;
    }

    // Generate JWT token with user id and email
    const accessToken = generateToken({ id: foundUser._id, email: foundUser.email });
    logger.info(`Token generated for user: ${email}, Token: ${accessToken.substring(0, 20)}...`);

    // Set token in cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Prepare user data to return (excluding sensitive fields)
    const userData = {
      id: foundUser._id,
      fullName: foundUser.fullName,
      email: foundUser.email,
      mobile: foundUser.mobile,
      address: foundUser.address,
      profilePic: foundUser.profilePic,
      kycStatus: foundUser.kycStatus,
    };

    logger.info(`Login successful for user: ${email}`);
    res.status(200).json({
      status: true,
      message: 'Login successful',
      token: accessToken,
      user: userData,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}, Email: ${email}`);
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};

export { login };