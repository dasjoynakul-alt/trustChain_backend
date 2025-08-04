import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/Users.js';
import logger from '../utils/logger.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    logger.error(`Deserialize error: ${error.message}`);
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com/user/auth/google/callback' 
        : 'http://localhost:5050/user/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          user.name = profile.displayName || user.name;
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }

        const newUser = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          isVerified: true,
        });
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        logger.error(`Google strategy error: ${error.message}`);
        done(error, null);
      }
    }
  )
);

export default passport;