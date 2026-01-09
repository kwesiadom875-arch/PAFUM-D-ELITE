const mongoose = require('mongoose');

const FeaturedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  videoUrl: { type: String },
  link: { type: String, default: '/shop' }
});

module.exports = mongoose.model('Featured', FeaturedSchema);
