import User from '../models/users.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';  // Add this line
import cloudinary from '../config/cloudinary.js';
import Review from '../models/Review.js';

import { sendOTP,sendPasswordResetEmail } from '../services/emailService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, zipcode } = req.body;

    // Input validation
    if (!name || !email || !password || !zipcode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.otp.verified) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const userData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      zipcode: zipcode.trim(),
      otp: {
        code: otp,
        expiry: otpExpiry,
        verified: false
      }
    };

    // Create or update user
    const user = existingUser 
      ? await User.findOneAndUpdate(
          { email: email.toLowerCase() },
          userData,
          { new: true }
        )
      : await User.create(userData);

    // Send OTP
    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification code' });
    }

    res.status(200).json({
      message: 'Verification code sent to your email',
      userId: user._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    console.log('Verifying OTP:', { userId, otp }); // Debug log

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Stored OTP:', user.otp); // Debug log

    if (user.otp.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (!user.otp.code || !user.otp.expiry) {
      return res.status(400).json({ message: 'No OTP found for this user' });
    }

    if (Date.now() > new Date(user.otp.expiry).getTime()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Convert both to strings for comparison
    if (user.otp.code.toString() !== otp.toString()) {
      console.log('OTP mismatch:', { stored: user.otp.code, received: otp });
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark as verified
    user.otp.verified = true;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare password using the method defined in the User model
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const getProfile = async (req, res) => {
  try {
    // Get userId from auth middleware for 'me' or from params for specific user
    const userId = req.params.userId === 'me' ? req.user.userId : req.params.userId;

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get reviews for this user
    const reviews = await Review.find({ targetUser: userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    const responseData = {
      user: {
        id: user._id,
        avatar: user.avatar || 'https://via.placeholder.com/150',
        name: user.name,
        rating: user.rating || 0,
        completedTasks: user.completedTasks || 0,
        location: user.location || 'Not specified',
        city: user.city || 'Not specified',
        memberSince: user.createdAt?.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        }),
        bio: user.bio || 'No bio provided',
        level: user.level
      },
      stats: {
        tasksCompleted: user.completedTasks || 0,
        onTimeRate: user.onTimeRate || 100,
        repeatClients: user.repeatClients || 0
      },
      reviews: reviews.map(review => ({
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        reviewer: {
          name: review.reviewer.name,
          avatar: review.reviewer.avatar || 'https://via.placeholder.com/50'
        }
      }))
    };

    res.json(responseData);

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile',
      error: error.message 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, city,bio } = req.body;
    const userId = req.user.userId; // Fix: use userId from auth middleware

    const updateFields = {};

    // Only add fields that are present in the request
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (city) updateFields.city = city;
    if (bio)  updateFields.bio=bio;

    // Handle avatar upload if present
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'profile_pictures',
          width: 300,
          crop: "scale"
        });
        updateFields.avatar = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload profile picture'
        });
      }
    }

    // Only update if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    console.log('Updating user with ID:', userId, 'Fields:', updateFields);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Update user location
export const updateUserLocation = async (req, res) => {
    const { latitude, longitude } = req.body;

    // Check if latitude and longitude are valid numbers
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: 'Invalid location data' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: { location: { latitude, longitude } } }, // Correctly set the location object
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: "Location updated successfully", user });
    } catch (error) {
        console.error('Error updating user location:', error);
        res.status(500).json({ message: 'Server error while updating location' });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Return user details including id
        res.json({ 
            id: req.user.userId,
            name: req.user.name
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('Processing forgot password request for:', email);

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether a user exists
      return res.json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    }

    // Generate a 6-digit code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save the reset token
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    try {
      await sendPasswordResetEmail(email, resetToken);
      console.log('Reset email sent successfully to:', email);
      
      res.json({ 
        message: 'Password reset instructions have been sent to your email.',
        success: true
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      
      // Reset the token if email fails
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
      
      res.status(500).json({ 
        message: 'Failed to send reset instructions. Please try again.',
        success: false
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'An error occurred while processing your request',
      success: false
    });
  }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;
        
        console.log('Reset password attempt:', { email, resetToken });

        const user = await User.findOne({
            email: email,
            resetToken: resetToken,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            console.log('Invalid reset attempt:', { email, resetToken });
            return res.status(400).json({ 
                message: 'Invalid or expired reset code' 
            });
        }

        // Update password
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        console.log('Password reset successful for:', email);
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

export const updatePushToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    await User.findByIdAndUpdate(req.user.userId, {
      expoPushToken: token
    });

    res.json({ message: 'Push token updated successfully' });
  } catch (error) {
    console.error('Error updating push token:', error);
    res.status(500).json({ message: 'Error updating push token' });
  }
};

export const getUserAvatars = async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ message: 'userIds must be an array' });
    }

    const users = await User.find(
      { _id: { $in: userIds } },
      'avatar _id'
    );

    const avatarMap = users.reduce((acc, user) => {
      acc[user._id] = user.avatar || '';
      return acc;
    }, {});

    res.json(avatarMap);
  } catch (error) {
    console.error('Error fetching avatars:', error);
    res.status(500).json({ message: 'Error fetching avatars' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Get reviews for this user
    const reviews = await Review.find({ targetUser: user._id })
        .populate('reviewer', 'name avatar')
        .sort({ createdAt: -1 });

    res.json({
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        city: user.city,
        rating: user.rating,
        level: user.level,
        completedTasks: user.completedTasks,
        reviews: reviews.map(review => ({
            _id: review._id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            reviewer: {
                name: review.reviewer.name,
                avatar: review.reviewer.avatar
            }
        }))
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

export const createReview = async (req, res) => {
  try {
      const { rating, comment } = req.body;
      const targetUserId = req.params.userId;
      
      // Get reviewerId from req.user.userId instead of req.user._id
      const reviewerId = req.user.userId;

      console.log('Creating review with data:', {
          rating,
          comment,
          targetUserId,
          reviewerId
      });

      // Input validation
      if (!rating || rating < 1 || rating > 5) {
          return res.status(400).json({ message: 'Invalid rating' });
      }

      if (!comment || comment.trim().length === 0) {
          return res.status(400).json({ message: 'Review comment is required' });
      }

      // Prevent self-review
      if (targetUserId === reviewerId) {
          return res.status(400).json({ message: 'Cannot review yourself' });
      }

      // Check if user exists
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
          return res.status(404).json({ message: 'Target user not found' });
      }

      // Check for existing review
      const existingReview = await Review.findOne({
          reviewer: reviewerId,
          targetUser: targetUserId
      });

      if (existingReview) {
          return res.status(400).json({ message: 'You have already reviewed this user' });
      }

      // Create review
      const review = await Review.create({
          reviewer: reviewerId,
          targetUser: targetUserId,
          rating: Number(rating),
          comment: comment.trim()
      });

      // Update user's average rating
      const reviews = await Review.find({ targetUser: targetUserId });
      const avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;

      await User.findByIdAndUpdate(targetUserId, {
          rating: Number(avgRating.toFixed(1))
      });

      // Return populated review
      const populatedReview = await Review.findById(review._id)
          .populate('reviewer', 'name avatar')
          .lean();

      res.status(201).json(populatedReview);

  } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ 
          message: 'Error creating review',
          error: error.message 
      });
  }
};
