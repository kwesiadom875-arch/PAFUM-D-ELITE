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
    productName: String,
    productImage: String,
    originalPrice: Number,
    finalPrice: Number,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('User', userSchema);