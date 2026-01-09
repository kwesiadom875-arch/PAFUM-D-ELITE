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
    enum: ['pending', 'in-progress', 'submitted', 'in-review', 'success', 'failed', 'expired'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    default: ''
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
  testingConditions: {
    indoorAC: { type: Boolean, default: false },
    indoorNoAC: { type: Boolean, default: false },
    outdoorMorning: { type: Boolean, default: false },
    outdoorAfternoon: { type: Boolean, default: false },
    outdoorEvening: { type: Boolean, default: false }
  },
  climateObservations: {
    heatEffect: { type: String, default: '' },
    humidityEffect: { type: String, default: '' },
    cloyingEffect: { type: String, default: '' },
    temperateComparison: { type: String, default: '' }
  },
  recommendation: {
    type: String,
    enum: ['', 'add-excellent', 'add-caution', 'do-not-add'],
    default: ''
  },
  customerNotes: {
    type: String,
    default: ''
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
