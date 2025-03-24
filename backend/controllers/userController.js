import User from '../models/users.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendOTP } from '../services/emailService.js';

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
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        console.log('Processing forgot password for:', email);

        const user = await User.findOne({ email });

        // Always return success even if user not found (security best practice)
        if (!user) {
            console.log('User not found for email:', email);
            return res.json({ 
                message: 'If an account exists with this email, you will receive password reset instructions.' 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        // Save reset token
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        console.log('Reset token generated for user:', resetToken);

        // TODO: Send email with reset instructions
        // For development, return token directly
        res.json({ 
            message: 'Password reset instructions sent',
            resetToken // Remove in production
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            message: 'An error occurred while processing your request' 
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update password
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};
