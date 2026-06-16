const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    stocks: [
      {
        symbol: { type: String, required: true, uppercase: true },
        companyName: { type: String, default: '' },
        addedAt: { type: Date, default: Date.now },
        alertPrice: { type: Number, default: null },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Watchlist', watchlistSchema);
