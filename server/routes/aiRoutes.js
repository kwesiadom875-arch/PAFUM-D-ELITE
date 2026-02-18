const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const visualSearchController = require('../controllers/visualSearch');
const multer = require('multer');

// Configure Multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/josie', aiController.chatJosie);
router.post('/ai/scent-discovery', aiController.scentDiscovery);
router.post('/ai/enrich-all-products', aiController.enrichAllProducts);
router.post('/search/visual', upload.single('image'), visualSearchController.searchByImage);

module.exports = router;
