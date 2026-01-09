const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const webhookController = require('./webhookController');
const emailService = require('../services/emailService');

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userObj = user.toObject();

    // Calculate Loyalty Info
    const thresholds = {
      'Gold': 500,
      'Diamond': 2000,
      'Elite Diamond': 5000
    };

    let nextTier = 'Max Tier';
    let progress = 100;
    let nextThreshold = -1;

    if (user.spending < thresholds['Gold']) {
      nextTier = 'Gold';
      nextThreshold = thresholds['Gold'];
    } else if (user.spending < thresholds['Diamond']) {
      nextTier = 'Diamond';
      nextThreshold = thresholds['Diamond'];
    } else if (user.spending < thresholds['Elite Diamond']) {
      nextTier = 'Elite Diamond';
      nextThreshold = thresholds['Elite Diamond'];
    }

    if (nextThreshold !== -1) {
      // Calculate progress to next tier
      const currentTierThreshold = user.tier === 'Bronze' ? 0 : (user.tier === 'Gold' ? 500 : (user.tier === 'Diamond' ? 2000 : 0));
      progress = Math.min(100, Math.max(0, ((user.spending - currentTierThreshold) / (nextThreshold - currentTierThreshold)) * 100));
    }

    userObj.loyaltyInfo = {
      nextTier,
      nextThreshold,
      progress: progress.toFixed(1),
      currentSpending: user.spending
    };

    res.json(userObj);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: 'Profile updated successfully', user: userResponse });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Purchase / Checkout
exports.purchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, deliveryLocation, phoneNumber, invoiceEmail, paymentMethod, paymentReference } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    const oldTier = user.tier; // Store old tier for comparison
    let orderTotal = 0;
    const processedItems = [];

    // 1. Validate Stock & Calculate Total
    for (const item of items) {
      let product;

      // Try finding by custom numeric ID first
      if (item.productId && !isNaN(item.productId)) {
        product = await Product.findOne({ id: item.productId }).session(session);
      }

      // If not found, try finding by MongoDB _id
      if (!product && mongoose.Types.ObjectId.isValid(item.productId)) {
        product = await Product.findById(item.productId).session(session);
      }

      if (!product) {
        throw new Error(`Product ${item.productName} (ID: ${item.productId}) not found`);
      }

      // Handle Size Variants vs Main Stock
      if (item.selectedSize) {
        const sizeVariant = product.sizes.find(s => s.size === item.selectedSize);
        if (!sizeVariant) {
          throw new Error(`Size ${item.selectedSize} not found for ${product.name}`);
        }
        if (sizeVariant.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name} (${item.selectedSize})`);
        }

        // Deduct Stock
        sizeVariant.stockQuantity -= item.quantity;

        // Price Calculation (Use negotiated price if applicable, otherwise size price)
        const price = item.negotiated ? item.finalPrice : sizeVariant.price;
        orderTotal += price * item.quantity;

        // Check if stock is low and trigger webhook
        if (sizeVariant.stockQuantity <= 10 && sizeVariant.stockQuantity > 0) {
          webhookController.triggerStockAlert({
            _id: product._id,
            name: `${product.name} (${item.selectedSize})`,
            image: product.image,
            stockQuantity: sizeVariant.stockQuantity,
            category: product.category,
            price: sizeVariant.price
          });
        }

      } else {
        // Main Product Stock
        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        // Deduct Stock
        product.stockQuantity -= item.quantity;

        // Price Calculation
        const price = item.negotiated ? item.finalPrice : product.price;
        orderTotal += price * item.quantity;

        // Check if stock is low and trigger webhook
        if (product.stockQuantity <= 10 && product.stockQuantity > 0) {
          webhookController.triggerStockAlert({
            _id: product._id,
            name: product.name,
            image: product.image,
            stockQuantity: product.stockQuantity,
            category: product.category,
            price: product.price
          });
        }
      }

      // Update Availability
      const hasStock = product.sizes.some(s => s.stockQuantity > 0) || product.stockQuantity > 0;
      product.isAvailable = hasStock;

      await product.save({ session });

      processedItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.image,
        productCategory: product.category,
        originalPrice: item.originalPrice,
        finalPrice: item.negotiated ? item.finalPrice : (item.selectedSize ? product.sizes.find(s => s.size === item.selectedSize).price : product.price),
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        negotiated: item.negotiated || false,
        deliveryLocation,
        phoneNumber,
        invoiceEmail,
        paymentMethod,
        paymentReference,
        date: new Date()
      });
    }

    // 2. Apply Tier Discount (if not already negotiated)
    // Note: Usually negotiated prices exclude further tier discounts, but let's apply global logic if needed.
    // For now, we assume the frontend sends the 'finalPrice' which might already include discounts.
    // However, to be safe and consistent with backend logic, we should re-calculate if we want to be strict.
    // But since we trust the 'finalPrice' from the loop above (which comes from DB or negotiation), we use that.

    // 3. Update User Stats (Spending & Points)
    user.spending += orderTotal;
    user.points += Math.floor(orderTotal / 10); // 1 point per 10 currency units

    // 4. Update Tier
    if (user.spending >= 5000) user.tier = 'Elite Diamond';
    else if (user.spending >= 2000) user.tier = 'Diamond';
    else if (user.spending >= 500) user.tier = 'Gold';
    else user.tier = 'Bronze';

    const newTier = user.tier;

    // 5. Add to Order History
    user.orderHistory.push(...processedItems);

    await user.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Trigger webhooks AFTER successful transaction
    // Trigger order created webhook for each item
    for (const item of processedItems) {
      webhookController.triggerOrderCreated({
        _id: item.productId,
        username: user.username,
        email: user.email,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        originalPrice: item.originalPrice,
        finalPrice: item.finalPrice,
        status: 'completed',
        date: item.date,
        tier: newTier
      });

      // Send Order Success Email
      emailService.sendOrderSuccessEmail(user.email, {
        productName: item.productName,
        total: item.finalPrice,
        reference: item.paymentReference || 'N/A'
      });
    }

    // Trigger tier upgrade webhook if tier changed
    if (oldTier !== newTier) {
      webhookController.triggerTierUpgraded(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          totalSpent: user.spending
        },
        oldTier,
        newTier
      );

      // Send Tier Upgrade Email
      emailService.sendAIPersonalizedEmail(user, 'TIER_UPGRADE', { oldTier, newTier });
    }

    res.json({
      message: 'Purchase successful',
      user: {
        tier: user.tier,
        spending: user.spending,
        points: user.points
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Purchase error:', error);
    res.status(400).json({ error: error.message });
  }
};
