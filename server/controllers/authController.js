const User = require('../models/User');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || "parfum_delite_secret_key_123";

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }
    
    const hashedPassword = await argon2.hash(password);
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = Date.now() + 3600000 * 24; // 24 hours

    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry
    });
    
    await newUser.save();
    
    // Send verification email
    await sendVerificationEmail(newUser.email, verificationToken);
    
    res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
  } catch (e) { 
    console.error("Register Error:", e);
    // Use a more specific check for duplicate key error
    if (e.code === 11000) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }
    res.status(500).json({ message: "Registration failed. Please try again." }); 
  }
};

// POST /api/auth/verify-email (for API calls)
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token: jwtToken, user: { username: user.username, email: user.email } });

  } catch (e) {
    console.error("Email Verification Error:", e);
    res.status(500).json({ message: "Email verification failed. Please try again." });
  }
};

// GET /api/auth/verify-email?token=xxx (for email links)
exports.verifyEmailGet = async (req, res) => {
  try {
    const { token } = req.query; // Read from query params instead of body
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Verification token is required." 
      });
    }

    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired verification token." 
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      success: true, 
      token: jwtToken, 
      user: { username: user.username, email: user.email } 
    });

  } catch (e) {
    console.error("Email Verification Error:", e);
    res.status(500).json({ 
      success: false, 
      message: "Email verification failed. Please try again." 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Auto-promote Super Admin
    if (user.email === 'agyakwesiadom@gmail.com') {
      if (!user.isSuperAdmin || !user.isAdmin) {
        user.isSuperAdmin = true;
        user.isAdmin = true;
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    
    // Return complete user object (excluding password)
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin || false,
      isTester: user.isTester || false,
      tier: user.tier || 'Bronze',
      totalSpent: user.totalSpent || 0,
      isVerified: user.isVerified || false,
      isSuperAdmin: user.isSuperAdmin || false
    };
    
    res.json({ token, user: userResponse });
  } catch (e) { 
    console.error("Login Error:", e);
    res.status(500).json({ message: "Login failed. Please try again." }); 
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // Security: Don't reveal if user exists
      return res.json({ message: "If an account exists, a reset link has been sent." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetTokenExpiry;
    await user.save();

    // Send email
    const { sendPasswordResetEmail } = require('../services/emailService');
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to process request." });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Hash new password
    const hashedPassword = await argon2.hash(newPassword);
    
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now login." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Failed to reset password." });
  }
};
