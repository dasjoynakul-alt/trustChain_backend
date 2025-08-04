import express from 'express';
     import { forgotPassword } from '../controllers/forgotPassword.js';
     import { getAccess } from '../controllers/getAccess.js';
     import { getTime } from '../controllers/getTime.js';
     import { getUser } from '../controllers/getUser.js';
     import { login } from '../controllers/login.js';
     import { logout } from '../controllers/logout.js';
     import { signUp } from '../controllers/signUp.js';
     import { forgotOtp } from '../controllers/forgotOtp.js';
     import { updatePassword } from '../controllers/updatePassword.js';
     import { signUpOtp } from '../controllers/signUpOtp.js';
     import { updateProfile } from '../controllers/updateProfile.js';
     import auth from '../middlewares/auth.js';
     import passport from 'passport';
     import googleAuth from '../middlewares/googleAuth.js';
     import rateLimit from 'express-rate-limit';
     import multer from 'multer';

     const router = express.Router();

     const authLimiter = rateLimit({
       windowMs: 15 * 60 * 1000,
       max: 100,
       message: { status: false, message: 'Too many requests. Try again later.' },
     });

     // Configure multer for file uploads
     const storage = multer.memoryStorage();
     const upload = multer({ storage });

     router.post('/signup', authLimiter, signUp);
     router.post('/login', authLimiter, login);
     router.get('/profile', authLimiter, auth, getUser);
     router.get('/access', authLimiter, auth, getAccess);
     router.post('/password/forgot', authLimiter, forgotPassword);
     router.post('/verify/signup', authLimiter, signUpOtp);
     router.post('/verify/forgot', authLimiter, forgotOtp);
     router.get('/otp/time', authLimiter, getTime);
     router.post('/password/update', authLimiter, updatePassword);
     router.put('/update-profile', authLimiter, auth, upload.single('profilePic'), updateProfile);

     router.get(
       '/auth/google',
       authLimiter,
       passport.authenticate('google', {
         scope: ['profile', 'email'],
         prompt: 'select_account',
       })
     );

     router.get(
       '/auth/google/callback',
       passport.authenticate('google', {
         failureRedirect: `${process.env.NODE_ENV === 'production' ? 'https://yourfrontend.com' : 'http://localhost:5173'}/login`,
         session: false,
       }),
       googleAuth
     );

     export default router;