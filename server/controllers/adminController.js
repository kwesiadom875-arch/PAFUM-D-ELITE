const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await User.aggregate([
      { $project: { orderCount: { $size: "$orderHistory" } } },
      { $group: { _id: null, total: { $sum: "$orderCount" } } }
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders: totalOrders.length > 0 ? totalOrders[0].total : 0,
    });
  } catch (error) {
    console.error('Admin summary error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSalesOverTime = async (req, res) => {
  try {
    const sales = await User.aggregate([
      { $unwind: "$orderHistory" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderHistory.date" } },
          totalSales: { $sum: "$orderHistory.finalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(sales);
  } catch (error) {
    console.error('Sales over time error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const users = await User.find({ 'orderHistory.0': { $exists: true } });
    
    let allOrders = [];
    users.forEach(user => {
      user.orderHistory.forEach(order => {
        allOrders.push({
          orderId: order._id || Math.random().toString(36).substr(2, 9),
          username: user.username,
          email: user.email,
          productName: order.productName,
          finalPrice: order.finalPrice,
          date: order.date,
          status: 'Paid'
        });
      });
    });

    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(allOrders);
  } catch (error) {
    console.error("Admin Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.updateStock = async (req, res) => {
  try {
    console.log("Update Stock Request Body:", req.body);
    const { productId, size, quantity, price } = req.body;
    
    let product;
    
    // 1. Try finding by custom numeric ID
    if (productId && !isNaN(productId)) {
      product = await Product.findOne({ id: productId });
    }

    // 2. If not found, try finding by MongoDB _id
    if (!product && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }

    if (!product) {
      console.log("Product not found for ID:", productId);
      return res.status(404).json({ error: "Product not found" });
    }

    if (size) {
      // Update size-specific stock or add new size
      const sizeIndex = product.sizes.findIndex(s => s.size === size);
      if (sizeIndex === -1) {
        // Add new size variant if it doesn't exist
        product.sizes.push({ 
          size, 
          stockQuantity: quantity, 
          price: price ? parseFloat(price) : product.price // Use provided price or default
        });
      } else {
        product.sizes[sizeIndex].stockQuantity = quantity;
        if (price) {
          product.sizes[sizeIndex].price = parseFloat(price);
        }
      }
    } else {
      // Update main stock
      product.stockQuantity = quantity;
    }

    // Update availability
    const hasStock = product.sizes.some(s => s.stockQuantity > 0) || product.stockQuantity > 0;
    product.isAvailable = hasStock;

    await product.save();

    res.json({
      message: "Stock updated successfully",
      product: {
        id: product.id,
        name: product.name,
        stockQuantity: product.stockQuantity,
        sizes: product.sizes,
        isAvailable: product.isAvailable
      }
    });
  } catch (error) {
    console.error("Stock Update Error:", error);
    res.status(500).json({ error: "Failed to update stock" });
  }
};
