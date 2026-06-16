const express = require('express');
const router = express.Router();
const { executeTrade, getOrders, getPortfolio } = require('../controllers/tradingController');
const { protect } = require('../middleware/auth');
router.post('/execute', protect, executeTrade);
router.get('/orders', protect, getOrders);
router.get('/portfolio', protect, getPortfolio);
module.exports = router;
