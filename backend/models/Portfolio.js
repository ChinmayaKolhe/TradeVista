const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  symbol: { type: String, required: true, uppercase: true },
  companyName: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 0 },
  avgBuyPrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  sector: { type: String, default: 'Unknown' },
});

holdingSchema.virtual('totalValue').get(function () {
  return this.quantity * this.currentPrice;
});

holdingSchema.virtual('totalCost').get(function () {
  return this.quantity * this.avgBuyPrice;
});

holdingSchema.virtual('pnl').get(function () {
  return this.totalValue - this.totalCost;
});

holdingSchema.virtual('pnlPercent').get(function () {
  if (this.totalCost === 0) return 0;
  return ((this.pnl / this.totalCost) * 100).toFixed(2);
});

const portfolioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    holdings: [holdingSchema],
    totalInvested: { type: Number, default: 0 },
    realizedPnl: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
