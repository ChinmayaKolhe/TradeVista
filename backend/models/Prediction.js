const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, uppercase: true },
    direction: { type: String, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'], required: true },
    confidence: { type: Number, min: 0, max: 100, required: true },
    currentPrice: { type: Number, required: true },
    targetPrice: { type: Number, required: true },
    reasoning: { type: String, default: '' },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    timeframe: { type: String, default: '1 week' },
    indicators: { type: Object, default: {} },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', predictionSchema);
