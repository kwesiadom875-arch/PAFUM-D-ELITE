const mongoose = require('mongoose');

const featuredProductsSchema = new mongoose.Schema({
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one document exists (singleton pattern)
featuredProductsSchema.statics.getFeatured = async function() {
  let featured = await this.findOne().populate('products');
  if (!featured) {
    featured = await this.create({ products: [] });
  }
  return featured;
};

featuredProductsSchema.statics.setFeatured = async function(productIds, userId) {
  // Limit to 4 products
  const limitedIds = productIds.slice(0, 4);
  
  let featured = await this.findOne();
  if (!featured) {
    featured = new this({ products: limitedIds, updatedBy: userId });
  } else {
    featured.products = limitedIds;
    featured.updatedBy = userId;
    featured.updatedAt = Date.now();
  }
  
  await featured.save();
  return await featured.populate('products');
};

module.exports = mongoose.model('FeaturedProducts', featuredProductsSchema);
