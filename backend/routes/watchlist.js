const express = require('express');
const router = express.Router();
const { getWatchlist, addStock, removeStock } = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');
router.get('/', protect, getWatchlist);
router.post('/add', protect, addStock);
router.delete('/remove/:symbol', protect, removeStock);
module.exports = router;
