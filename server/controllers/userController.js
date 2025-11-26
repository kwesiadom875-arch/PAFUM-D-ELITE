const User = require('../models/User');
const Product = require('../models/Product');
const { awardPoints } = require('../services/gamificationService');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.productId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json(user.wishlist);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.productId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.json(user.wishlist);
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.recordPurchase = async (req, res) => {
  try {
    const { items, deliveryLocation } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // STEP 1: Validate stock availability for all items
    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productName}` });
      }

      const quantity = item.quantity || 1;

      if (item.selectedSize) {
        // Check size-specific stock
        const sizeVariant = product.sizes.find(s => s.size === item.selectedSize);
        if (!sizeVariant) {
          return res.status(400).json({ error: `Size ${item.selectedSize} not available for ${product.name}` });
        }
        if (sizeVariant.stockQuantity < quantity) {
          return res.status(400).json({ 
            error: `Insufficient stock for ${product.name} (${item.selectedSize}). Only ${sizeVariant.stockQuantity} available.` 
          });
        }
      } else {
        // Check main stock
        if (product.stockQuantity < quantity) {
          return res.status(400).json({ 
            error:`Insufficient stock for ${product.name}. Only ${product.stockQuantity} available.` 
          });
        }
      }
    }

    // STEP 2: Record purchase in user order history
    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      user.orderHistory.push({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        productCategory: product.category,
        originalPrice: item.originalPrice,
        finalPrice: item.finalPrice,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity || 1,
        negotiated: item.negotiated || false,
        deliveryLocation: deliveryLocation || null,
        phoneNumber: req.body.phoneNumber,
        invoiceEmail: req.body.invoiceEmail,
        date: new Date()
      });
    }

    // STEP 3: Update spending and tier
    const purchaseTotal = items.reduce((sum, item) => sum + (item.finalPrice * (item.quantity || 1)), 0);
    user.spending += purchaseTotal;
    if (user.spending >= 15000) { user.tier = 'Elite Diamond'; }
    else if (user.spending >= 10001) { user.tier = 'Diamond'; }
    else if (user.spending >= 7001) { user.tier = 'Platinum'; }
    else if (user.spending >= 3001) { user.tier = 'Gold'; }
    else { user.tier = 'Bronze'; }
    await awardPoints(req.userId, 'purchase');
    await user.save();

    // STEP 4: Decrement stock for each item
    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      const quantity = item.quantity || 1;

      if (item.selectedSize) {
        const sizeIndex = product.sizes.findIndex(s => s.size === item.selectedSize);
        product.sizes[sizeIndex].stockQuantity -= quantity;
      } else {
        product.stockQuantity -= quantity;
      }

      // Update availability status
      const hasStock = product.sizes.some(s => s.stockQuantity > 0) || product.stockQuantity > 0;
      product.isAvailable = hasStock;
      
      await product.save();
    }

    const updatedUser = await User.findById(req.userId).select('-password');
    res.json({ 
      message: "Purchase recorded successfully", 
      user: updatedUser,
      orderDetails: {
        totalItems: items.length,
        totalAmount: purchaseTotal,
        deliveryLocation
      }
    });
  } catch (error) {
    console.error('Purchase recording error:', error);
    res.status(500).json({ error: error.message });
  }
};
