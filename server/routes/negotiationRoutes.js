const express = require('express');
const router = express.Router();
const negotiationController = require('../controllers/negotiationController');

router.post('/', negotiationController.negotiatePrice);

module.exports = router;
