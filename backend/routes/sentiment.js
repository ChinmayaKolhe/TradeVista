const express = require('express');
const router = express.Router();
const { getStockSentiment, getMarketSentiment } = require('../controllers/sentimentController');
const { protect } = require('../middleware/auth');
router.get('/market', protect, getMarketSentiment);
router.get('/:symbol', protect, getStockSentiment);
module.exports = router;
