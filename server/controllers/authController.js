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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { username: user.username, email: user.email } });
  } catch (e) { 
    console.error("Login Error:", e);
    res.status(500).json({ message: "Login failed. Please try again." }); 
  }
};
