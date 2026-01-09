const axios = require('axios');

// Store webhook URLs (in production, store these in environment variables or database)
const WEBHOOK_URLS = {
  ORDER_CREATED: process.env.MAKE_WEBHOOK_ORDER_CREATED || '',
  TIER_UPGRADED: process.env.MAKE_WEBHOOK_TIER_UPGRADED || '',
  CLIMATE_TEST_ASSIGNED: process.env.MAKE_WEBHOOK_CLIMATE_TEST || '',
  STOCK_ALERT: process.env.MAKE_WEBHOOK_STOCK_ALERT || '',
  PRODUCT_ADDED: process.env.MAKE_WEBHOOK_PRODUCT_ADDED || '',
  REVIEW_SUBMITTED: process.env.MAKE_WEBHOOK_REVIEW || ''
};

// Helper function to send webhook
const sendWebhook = async (webhookUrl, data) => {
  if (!webhookUrl) {
    console.log('Webhook URL not configured, skipping...');
    return;
  }

  try {
    await axios.post(webhookUrl, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000 // 5 second timeout
    });
    console.log(`Webhook sent successfully to ${webhookUrl}`);
  } catch (error) {
    console.error(`Webhook failed: ${error.message}`);
    // Don't throw error - webhooks should not break main flow
  }
};

// Trigger: New order created
exports.triggerOrderCreated = async (orderData) => {
  const payload = {
    event: 'order.created',
    timestamp: new Date().toISOString(),
    data: {
      orderId: orderData._id,
      customerName: orderData.username,
      customerEmail: orderData.email,
      productName: orderData.productName,
      productImage: orderData.productImage,
      quantity: orderData.quantity,
      originalPrice: orderData.originalPrice,
      finalPrice: orderData.finalPrice,
      discount: orderData.originalPrice - orderData.finalPrice,
      status: orderData.status,
      date: orderData.date,
      tier: orderData.tier
    }
  };

  await sendWebhook(WEBHOOK_URLS.ORDER_CREATED, payload);
};

// Trigger: Customer tier upgraded
exports.triggerTierUpgraded = async (userData, oldTier, newTier) => {
  const payload = {
    event: 'tier.upgraded',
    timestamp: new Date().toISOString(),
    data: {
      userId: userData._id,
      username: userData.username,
      email: userData.email,
      oldTier: oldTier,
      newTier: newTier,
      totalSpent: userData.totalSpent,
      benefits: getTierBenefits(newTier)
    }
  };

  await sendWebhook(WEBHOOK_URLS.TIER_UPGRADED, payload);
};

// Trigger: Climate test assigned
exports.triggerClimateTestAssigned = async (testData, testerData) => {
  const payload = {
    event: 'climate_test.assigned',
    timestamp: new Date().toISOString(),
    data: {
      testId: testData._id,
      perfumeName: testData.perfumeName,
      perfumeImage: testData.perfumeImage,
      climate: testData.climate,
      testerName: testerData.username,
      testerEmail: testerData.email,
      startDate: testData.startDate,
      endDate: testData.endDate,
      status: testData.status
    }
  };

  await sendWebhook(WEBHOOK_URLS.CLIMATE_TEST_ASSIGNED, payload);
};

// Trigger: Stock level low
exports.triggerStockAlert = async (productData) => {
  const payload = {
    event: 'stock.low',
    timestamp: new Date().toISOString(),
    data: {
      productId: productData._id,
      productName: productData.name,
      productImage: productData.image,
      currentStock: productData.stockQuantity,
      threshold: 10, // Low stock threshold
      category: productData.category,
      price: productData.price
    }
  };

  await sendWebhook(WEBHOOK_URLS.STOCK_ALERT, payload);
};

// Trigger: New product added
exports.triggerProductAdded = async (productData) => {
  const payload = {
    event: 'product.added',
    timestamp: new Date().toISOString(),
    data: {
      productId: productData._id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      image: productData.image,
      notes: productData.notes,
      perfumer: productData.perfumer,
      brand: productData.brand,
      gender: productData.gender
    }
  };

  await sendWebhook(WEBHOOK_URLS.PRODUCT_ADDED, payload);
};

// Trigger: Review submitted
exports.triggerReviewSubmitted = async (reviewData) => {
  const payload = {
    event: 'review.submitted',
    timestamp: new Date().toISOString(),
    data: {
      reviewId: reviewData._id,
      productId: reviewData.productId,
      productName: reviewData.productName,
      customerName: reviewData.username,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: reviewData.date
    }
  };

  await sendWebhook(WEBHOOK_URLS.REVIEW_SUBMITTED, payload);
};

// Helper: Get tier benefits
const getTierBenefits = (tier) => {
  const benefits = {
    'Bronze': ['Standard shipping', 'Basic support'],
    'Gold': ['Free shipping on orders over GH₵500', 'Priority support', '5% discount'],
    'Platinum': ['Free shipping on all orders', 'Priority support', '10% discount', 'Early access to new products'],
    'Diamond': ['Free express shipping', 'VIP support', '15% discount', 'Early access', 'Exclusive products'],
    'Elite Diamond': ['Free express shipping', 'Dedicated concierge', '20% discount', 'Early access', 'Ultra Niche access', 'Personal consultation']
  };
  return benefits[tier] || [];
};

module.exports = exports;
