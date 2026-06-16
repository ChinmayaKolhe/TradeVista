const express = require('express');
const router = express.Router();
const { getPrediction, getRecentPredictions } = require('../controllers/predictionController');
const { protect } = require('../middleware/auth');
router.get('/recent', protect, getRecentPredictions);
router.get('/:symbol', protect, getPrediction);
module.exports = router;
