const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userVibe: {
    type: String,
    required: true,
    trim: true
  },
  aiRecommendation: {
    type: String,
    required: true,
    trim: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', requestSchema);