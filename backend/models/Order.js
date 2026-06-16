const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true, uppercase: true },
    companyName: { type: String, default: '' },
    type: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['EXECUTED', 'PENDING', 'CANCELLED'], default: 'EXECUTED' },
    pnl: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
