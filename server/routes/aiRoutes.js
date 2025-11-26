const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/josie', aiController.chatJosie);
router.post('/ai/scent-discovery', aiController.scentDiscovery);
router.post('/ai/enrich-all-products', aiController.enrichAllProducts);

module.exports = router;
