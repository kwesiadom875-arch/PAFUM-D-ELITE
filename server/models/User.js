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
    productCategory: String,
    originalPrice: Number,
    finalPrice: Number,
    selectedSize: String,
    quantity: Number,
    negotiated: { type: Boolean, default: false },
    deliveryLocation: Object,
    phoneNumber: String,
    invoiceEmail: String,
    paymentMethod: String,
    paymentReference: String,
    date: { type: Date, default: Date.now }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    date: { type: Date, default: Date.now }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
  isAdmin: {
    type: Boolean,
    default: false
  },
  isTester: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  passwordResetToken: String,
  passwordResetExpiry: Date,
  lastCheckIn: {
    productId: String,
    productName: String,
    date: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);