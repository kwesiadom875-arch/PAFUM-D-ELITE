const express = require('express');
const router = express.Router();
const imageProxyController = require('../controllers/imageProxyController');

// Using just "/" here because this route will be mounted at /proxy-image in app.js
router.get('/', imageProxyController.proxyImage);

module.exports = router;
