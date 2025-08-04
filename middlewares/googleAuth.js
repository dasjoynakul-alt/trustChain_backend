import User from '../models/Users.js';
import generateToken from '../utils/generateToken.js';
import logger from '../utils/logger.js';

export default async (req, res) => {
  try {
    const { user } = req;
    logger.info(`Google user data: ${JSON.stringify(user)}`);

    if (!user.email) {
      logger.warn('Email not found in Google user data');
      throw new Error('Email not found in user data');
    }

    const email = user.email;
    const name = user.name || 'Unknown';
    const googleId = user.googleId || user.sub;

    let existingUser = await User.findOne({ email });
    if (!existingUser) {
      existingUser = new User({
        email,
        fullName: name,
        googleId,
        isVerified: true,
      });
      await existingUser.save();
      logger.info(`New Google user created: ${email}`);
    }

    const token = generateToken({ id: existingUser._id, email: existingUser.email });
    logger.info(`Google auth token generated for user: ${email}, Token: ${token.substring(0, 20)}...`);

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    logger.info(`Google auth successful: ${email}`);
    res.redirect(`http://localhost:5173/user/home?token=${token}`);
  } catch (error) {
    logger.error(`Google auth error: ${error.message}`);
    res.redirect(`http://localhost:5173/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
};