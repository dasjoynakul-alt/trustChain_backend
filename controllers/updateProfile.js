import User from '../models/Users.js';
     import { cloudinary } from '../config/cloudinary.js';
     import logger from '../utils/logger.js';

     export const updateProfile = async (req, res) => {
       try {
         // Check if req.user exists
         if (!req.user || !req.user.id) {
           logger.warn('Unauthorized attempt to update profile');
           return res.status(401).json({ status: false, message: 'Unauthorized: User not authenticated' });
         }

         const userId = req.user.id;
         const { fullName, mobile, street, state, country, postalCode } = req.body;
         logger.info(`Updating profile for userId: ${userId}, Data: ${JSON.stringify(req.body)}`);

         // Prepare update data
         const updateData = {
           fullName: fullName || undefined,
           mobile: mobile || undefined,
           address: {
             street: street || undefined,
             state: state || undefined,
             country: country || undefined,
             postalCode: postalCode || undefined,
           },
         };

         // Handle profile picture upload
         if (req.file) {
           logger.info(`Uploading profile picture for userId: ${userId}`);
           const result = await new Promise((resolve, reject) => {
             const stream = cloudinary.uploader.upload_stream(
               { folder: 'profile_pics', resource_type: 'image' },
               (error, result) => {
                 if (error) {
                   logger.error(`Cloudinary upload error: ${error.message}`);
                   reject(error);
                 } else {
                   logger.info(`Cloudinary upload successful: ${result.secure_url}`);
                   resolve(result);
                 }
               }
             );
             stream.end(req.file.buffer);
           });

           updateData.profilePic = result.secure_url;
         }

         // Update user in the database
         logger.info(`Updating user in DB: ${userId}`);
         const updatedUser = await User.findByIdAndUpdate(
           userId,
           { $set: updateData },
           { new: true, runValidators: true }
         ).select('-password -forgot_otp');

         if (!updatedUser) {
           logger.warn(`User not found for id: ${userId}`);
           return res.status(404).json({ status: false, message: 'User not found' });
         }

         logger.info(`Profile updated successfully for userId: ${userId}`);
         return res.status(200).json({ status: true, user: updatedUser, message: 'Profile updated successfully' });
       } catch (error) {
         logger.error(`Update profile error: ${error.message}, UserId: ${req.user?.id}`);
         return res.status(500).json({ status: false, message: error.message || 'Failed to update profile' });
       }
     };