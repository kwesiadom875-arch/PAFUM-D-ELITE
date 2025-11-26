const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    let product;
    // Check if the ID is numeric (for the custom 'id' field)
    if (!isNaN(req.params.id)) {
      product = await Product.findOne({ id: req.params.id });
    }
    
    // If not found or not numeric, check if it's a valid MongoDB ObjectId
    if (!product && mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id);
    }
    
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (e) {
    console.error("Error in getProductById:", e);
    res.status(500).json({ error: e.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.deleteProduct = async (req, res) => {
  try {
    let result = await Product.findOneAndDelete({ id: req.params.id });
    if (!result && mongoose.Types.ObjectId.isValid(req.params.id)) {
      result = await Product.findByIdAndDelete(req.params.id);
    }
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!product && mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    }
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getRecommendationsByUser = async (req, res) => {
  try {
    const User = require('../models/User'); // Lazy load to avoid circular dependency if any
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orderHistory = user.orderHistory;
    if (orderHistory.length === 0) {
      // If no order history, return top 5 rated products
      const topProducts = await Product.find().sort({ rating: -1 }).limit(5);
      return res.json(topProducts);
    }

    const recentCategories = [...new Set(orderHistory.slice(-5).map(item => item.productCategory))];
    const recentProductIds = orderHistory.map(item => item.productId);

    const recommendedProducts = await Product.find({
      category: { $in: recentCategories },
      id: { $nin: recentProductIds } // Exclude already purchased products
    }).limit(10);

    res.json(recommendedProducts);
  } catch (error) {
    console.error('User recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getRecommendationsByProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const recommendedProducts = await Product.find({
      category: product.category,
      id: { $ne: product.id } // Exclude the product itself
    }).limit(5);

    res.json(recommendedProducts);
  } catch (error) {
    console.error('Product recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
};
