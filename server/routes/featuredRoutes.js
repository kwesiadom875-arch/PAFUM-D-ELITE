const express = require('express');
const router = express.Router();
const featuredController = require('../controllers/featuredController');

router.get('/', featuredController.getFeatured);
router.post('/', featuredController.updateFeatured);

module.exports = router;
