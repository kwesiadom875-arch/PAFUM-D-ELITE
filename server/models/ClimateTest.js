const mongoose = require('mongoose');

const climateTestSchema = new mongoose.Schema({
  perfumeName: {
    type: String,
    required: true
  },
  perfumeImage: {
    type: String,
    default: ''
  },
  testerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  climate: {
    type: String,
    required: true,
    default: 'Room Temperature'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  remarks: [{
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    author: {
      type: String,
      default: 'Tester'
    }
  }],
  finalRating: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ClimateTest', climateTestSchema);
