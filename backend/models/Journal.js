const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true, uppercase: true },
    tradeType: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, default: null },
    pnl: { type: Number, default: 0 },
    emotion: {
      type: String,
      enum: ['confident', 'fearful', 'greedy', 'neutral', 'anxious', 'excited'],
      default: 'neutral',
    },
    strategy: { type: String, default: '' },
    notes: { type: String, default: '' },
    aiInsight: { type: String, default: '' },
    tags: [String],
    outcome: { type: String, enum: ['win', 'loss', 'breakeven', 'open'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Journal', journalSchema);
