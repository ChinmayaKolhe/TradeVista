const Journal = require('../models/Journal');

// @desc    Create journal entry
// @route   POST /api/journal
exports.createEntry = async (req, res) => {
  try {
    const entry = await Journal.create({ user: req.user._id, ...req.body });

    // Generate simple AI insight
    let aiInsight = '';
    if (entry.emotion === 'fearful' && entry.tradeType === 'SELL') {
      aiInsight = 'Fear-driven sells often lead to missed recovery opportunities. Consider using stop-losses instead.';
    } else if (entry.emotion === 'greedy' && entry.tradeType === 'BUY') {
      aiInsight = 'Greed-driven buys near highs can increase downside risk. Always check RSI and volume before entry.';
    } else if (entry.strategy) {
      aiInsight = `Your ${entry.strategy} strategy shows consistency. Track win-rate to optimize entry timing.`;
    } else {
      aiInsight = 'Log your trades consistently to identify patterns in your best-performing setups.';
    }

    entry.aiInsight = aiInsight;
    await entry.save();

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all journal entries for user
// @route   GET /api/journal
exports.getEntries = async (req, res) => {
  try {
    const { limit = 50, symbol } = req.query;
    const filter = { user: req.user._id };
    if (symbol) filter.symbol = symbol.toUpperCase();

    const entries = await Journal.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get journal analytics
// @route   GET /api/journal/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const entries = await Journal.find({ user: req.user._id });

    const totalTrades = entries.length;
    const wins = entries.filter((e) => e.outcome === 'win').length;
    const losses = entries.filter((e) => e.outcome === 'loss').length;
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;

    const emotionBreakdown = entries.reduce((acc, e) => {
      acc[e.emotion] = (acc[e.emotion] || 0) + 1;
      return acc;
    }, {});

    const totalPnl = entries.reduce((acc, e) => acc + (e.pnl || 0), 0);

    const insights = [
      wins > losses
        ? `Your win rate of ${winRate}% is solid. Keep focusing on high-probability setups.`
        : `Review your losing trades — identify common patterns to avoid.`,
      emotionBreakdown.greedy > 2
        ? 'Multiple greedy trades detected. Use position sizing rules to control overexposure.'
        : 'Good emotional discipline observed in your trade logs.',
    ];

    res.json({
      success: true,
      analytics: { totalTrades, wins, losses, winRate, totalPnl: +totalPnl.toFixed(2), emotionBreakdown, insights },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update journal entry
// @route   PUT /api/journal/:id
exports.updateEntry = async (req, res) => {
  try {
    const entry = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
