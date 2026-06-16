const Watchlist = require('../models/Watchlist');

exports.getWatchlist = async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) watchlist = await Watchlist.create({ user: req.user._id, stocks: [] });
    res.json({ success: true, watchlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addStock = async (req, res) => {
  try {
    const { symbol, companyName, alertPrice } = req.body;
    let watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) watchlist = await Watchlist.create({ user: req.user._id, stocks: [] });

    const exists = watchlist.stocks.find((s) => s.symbol === symbol.toUpperCase());
    if (exists) return res.status(400).json({ success: false, message: 'Stock already in watchlist' });

    watchlist.stocks.push({ symbol: symbol.toUpperCase(), companyName: companyName || symbol, alertPrice });
    await watchlist.save();

    res.json({ success: true, watchlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeStock = async (req, res) => {
  try {
    const { symbol } = req.params;
    const watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) return res.status(404).json({ success: false, message: 'Watchlist not found' });

    watchlist.stocks = watchlist.stocks.filter((s) => s.symbol !== symbol.toUpperCase());
    await watchlist.save();

    res.json({ success: true, watchlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
