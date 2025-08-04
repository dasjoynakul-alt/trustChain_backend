import nodemailer from 'nodemailer';
import 'dotenv/config';
import logger from '../utils/logger.js';

const sendEmail = async ({ email, type, otp }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.APP_PASSWORD) {
      throw new Error('Email credentials are not configured in .env file');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: `"Trustchain Ventures" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: type === 'register' ? 'Verify Your Trustchain Ventures Account' : 'Trustchain Ventures Password Reset OTP',
      html: type === 'register' ? `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #3b82f6, #60a5fa); padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://imgs.search.brave.com/vaoGzGaq9P3o2ipgr_AnMu1TGqwv1UAGMpKNUYu-aNw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1LzAyLzEyLzc3/LzM2MF9GXzUwMjEy/NzcyN19wSW1LOTEz/WHdpU3BxbEY0cGdK/VFJhVEM0YTlVbndB/Ni5qcGc" alt="Trustchain Ventures Logo" style="max-width: 150px; height: auto;" />
            <h2 style="font-size: 28px; font-weight: bold; margin: 15px 0; color: #ffffff;">Welcome to Trustchain Ventures!</h2>
          </div>
          <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; text-align: center;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Thank you for joining Trustchain Ventures. Please use the OTP below to verify your account:</p>
            <div style="display: inline-block; background: #ffffff; color: #1e3a8a; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">${otp}</div>
            <p style="font-size: 14px; line-height: 1.6; margin-top: 20px;">This OTP is valid for <strong>2 minutes</strong>. Please do not share it with anyone.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #e0e0e0;">
            <p>If you didn’t request this, please ignore this email or contact our <a href="mailto:support@trustchainventures.com" style="color: #bfdbfe; text-decoration: none;">support team</a>.</p>
            <p>Trustchain Ventures • <a href="https://www.trustchainventures.com" style="color: #bfdbfe; text-decoration: none;">www.trustchainventures.com</a></p>
            <p><a href="https://www.trustchainventures.com/unsubscribe" style="color: #bfdbfe; text-decoration: none;">Unsubscribe</a></p>
          </div>
        </div>
      ` : `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f97316, #fb923c); padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://via.placeholder.com/150x50?text=Trustchain+Ventures+Logo" alt="Trustchain Ventures Logo" style="max-width: 150px; height: auto;" />
            <h2 style="font-size: 28px; font-weight: bold; margin: 15px 0; color: #ffffff;">Password Reset Request</h2>
          </div>
          <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; text-align: center;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Use the OTP below to reset your Trustchain Ventures password:</p>
            <div style="display: inline-block; background: #ffffff; color: #7c2d12; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">${otp}</div>
            <p style="font-size: 14px; line-height: 1.6; margin-top: 20px;">This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #e0e0e0;">
            <p>If you didn’t request this, please ignore this email or contact our <a href="mailto:support@trustchainventures.com" style="color: #fed7aa; text-decoration: none;">support team</a>.</p>
            <p>Trustchain Ventures • <a href="https://www.trustchainventures.com" style="color: #fed7aa; text-decoration: none;">www.trustchainventures.com</a></p>
            <p><a href="https://www.trustchainventures.com/unsubscribe" style="color: #fed7aa; text-decoration: none;">Unsubscribe</a></p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    logger.error(`Send email error: ${error.message}`);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;