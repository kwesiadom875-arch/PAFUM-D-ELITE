const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  perfumeName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedPrice: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['Highly Niche/Rare', 'Standard Request', 'Uncategorized'],
    default: 'Uncategorized'
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Fulfilled', 'Cancelled'],
    default: 'Pending'
  },
  aiNotes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ category: 1 });

module.exports = mongoose.model('Request', requestSchema);