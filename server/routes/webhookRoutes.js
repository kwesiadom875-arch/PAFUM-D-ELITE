const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Test endpoint to verify webhook configuration
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Webhook endpoints are active',
    configured: {
      orderCreated: !!process.env.MAKE_WEBHOOK_ORDER_CREATED,
      tierUpgraded: !!process.env.MAKE_WEBHOOK_TIER_UPGRADED,
      climateTest: !!process.env.MAKE_WEBHOOK_CLIMATE_TEST,
      stockAlert: !!process.env.MAKE_WEBHOOK_STOCK_ALERT,
      productAdded: !!process.env.MAKE_WEBHOOK_PRODUCT_ADDED,
      reviewSubmitted: !!process.env.MAKE_WEBHOOK_REVIEW
    }
  });
});

// Manual trigger endpoints (for testing)
router.post('/trigger/order', async (req, res) => {
  try {
    await webhookController.triggerOrderCreated(req.body);
    res.json({ success: true, message: 'Order webhook triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/trigger/tier', async (req, res) => {
  try {
    const { userData, oldTier, newTier } = req.body;
    await webhookController.triggerTierUpgraded(userData, oldTier, newTier);
    res.json({ success: true, message: 'Tier upgrade webhook triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/trigger/climate-test', async (req, res) => {
  try {
    const { testData, testerData } = req.body;
    await webhookController.triggerClimateTestAssigned(testData, testerData);
    res.json({ success: true, message: 'Climate test webhook triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/trigger/stock-alert', async (req, res) => {
  try {
    await webhookController.triggerStockAlert(req.body);
    res.json({ success: true, message: 'Stock alert webhook triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/trigger/product', async (req, res) => {
  try {
    await webhookController.triggerProductAdded(req.body);
    res.json({ success: true, message: 'Product added webhook triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/trigger/review', async (req, res) => {
  try {
    await webhookController.triggerReviewSubmitted(req.body);
    res.json({ success: true, message: 'Review webhook triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
