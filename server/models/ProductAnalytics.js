const mongoose = require('mongoose');

const productAnalyticsSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true
  },
  requestCount: {
    type: Number,
    default: 0
  },
  salesVelocity: {
    last30Days: { type: Number, default: 0 },
    last90Days: { type: Number, default: 0 },
    last180Days: { type: Number, default: 0 }
  },
  lastRestockDate: {
    type: Date,
    default: null
  },
  restockPriority: {
    type: String,
    enum: ['High Priority Restock', 'Monitor Closely', 'Low Demand'],
    default: 'Monitor Closely'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Index for restock priority queries
productAnalyticsSchema.index({ restockPriority: 1 });
productAnalyticsSchema.index({ productId: 1 });

module.exports = mongoose.model('ProductAnalytics', productAnalyticsSchema);
