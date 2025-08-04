import logger from '../utils/logger.js';

const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
    });
    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
    });

    res.status(200).json({ message: 'Logged out successfully', status: true });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    next(error);
  }
};

export { logout };