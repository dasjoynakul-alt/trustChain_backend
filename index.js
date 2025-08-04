import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import getConnection from './utils/getConnection.js';
import userRouter from './routes/user.js';
import errorHandler from './middlewares/errorHandler.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';

const app = express();

// রেট লিমিটিং
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ১৫ মিনিট
  max: 5, // প্রতি ইমেইল থেকে ৫টি রিকোয়েস্ট
  keyGenerator: (req) => req.body.email || req.ip,
  message: 'Too many OTP requests. Please try again later.',
});

// CORS কনফিগারেশন
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// মিডলওয়্যার
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.ACCESS_TOKEN_KEY || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

import './config/passport.js';

// রাউটস
app.use('/user/signup', otpLimiter);
app.use('/user/verify/signup', otpLimiter);
app.use('/user', userRouter);

// এরর হ্যান্ডলার
app.use(errorHandler);

// MongoDB কানেকশন
getConnection();

// সার্ভার রান
const port = process.env.PORT || 5050;
app.listen(port, () => {
  logger.info(`Server is running on port: ${port}`);
});