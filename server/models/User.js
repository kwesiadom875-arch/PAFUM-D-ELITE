const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  spending: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    default: 'Bronze'
  },
  orderHistory: [{
    productId: String,
    productName: String,
    productImage: String,
    originalPrice: Number,
    finalPrice: Number,
    negotiated: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    sparse: true  // Allows multiple null values
  },
  verificationTokenExpiry: {
    type: Date
  },
  passwordResetToken: {
    type: String,
    sparse: true
  },
  passwordResetExpiry: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);