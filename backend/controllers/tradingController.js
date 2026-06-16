const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Order = require('../models/Order');

// @desc    Execute a trade (Buy/Sell)
// @route   POST /api/trading/execute
exports.executeTrade = async (req, res) => {
  try {
    const { symbol, type, quantity, price, companyName } = req.body;

    if (!symbol || !type || !quantity || !price) {
      return res.status(400).json({ success: false, message: 'Missing required trade fields' });
    }

    const user = await User.findById(req.user._id);
    const totalAmount = quantity * price;

    if (type === 'BUY') {
      if (user.virtualBalance < totalAmount) {
        return res.status(400).json({ success: false, message: 'Insufficient virtual balance' });
      }

      // Deduct balance
      user.virtualBalance -= totalAmount;
      await user.save();

      // Update portfolio
      let portfolio = await Portfolio.findOne({ user: req.user._id });
      if (!portfolio) portfolio = await Portfolio.create({ user: req.user._id });

      const holdingIndex = portfolio.holdings.findIndex((h) => h.symbol === symbol.toUpperCase());

      if (holdingIndex > -1) {
        const existing = portfolio.holdings[holdingIndex];
        const newQty = existing.quantity + quantity;
        existing.avgBuyPrice = (existing.totalCost + totalAmount) / newQty;
        existing.quantity = newQty;
        existing.currentPrice = price;
      } else {
        portfolio.holdings.push({
          symbol: symbol.toUpperCase(),
          companyName: companyName || symbol,
          quantity,
          avgBuyPrice: price,
          currentPrice: price,
        });
      }

      portfolio.totalInvested += totalAmount;
      await portfolio.save();

      const order = await Order.create({
        user: req.user._id,
        symbol: symbol.toUpperCase(),
        companyName: companyName || symbol,
        type: 'BUY',
        quantity,
        price,
        totalAmount,
      });

      req.io.to(`stock_${symbol}`).emit('trade_executed', { type: 'BUY', symbol, quantity, price });

      return res.status(201).json({
        success: true,
        message: `Successfully bought ${quantity} shares of ${symbol}`,
        order,
        newBalance: user.virtualBalance,
      });
    }

    if (type === 'SELL') {
      let portfolio = await Portfolio.findOne({ user: req.user._id });
      const holdingIndex = portfolio?.holdings.findIndex((h) => h.symbol === symbol.toUpperCase());

      if (holdingIndex === -1 || !portfolio || portfolio.holdings[holdingIndex].quantity < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient holdings to sell' });
      }

      const holding = portfolio.holdings[holdingIndex];
      const pnl = (price - holding.avgBuyPrice) * quantity;

      holding.quantity -= quantity;
      holding.currentPrice = price;

      if (holding.quantity === 0) {
        portfolio.holdings.splice(holdingIndex, 1);
      }

      portfolio.totalInvested -= holding.avgBuyPrice * quantity;
      portfolio.realizedPnl += pnl;
      await portfolio.save();

      user.virtualBalance += totalAmount;
      await user.save();

      const order = await Order.create({
        user: req.user._id,
        symbol: symbol.toUpperCase(),
        companyName: companyName || symbol,
        type: 'SELL',
        quantity,
        price,
        totalAmount,
        pnl,
      });

      req.io.to(`stock_${symbol}`).emit('trade_executed', { type: 'SELL', symbol, quantity, price });

      return res.status(201).json({
        success: true,
        message: `Successfully sold ${quantity} shares of ${symbol}`,
        order,
        newBalance: user.virtualBalance,
        pnl,
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid trade type' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order history
// @route   GET /api/trading/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get portfolio
// @route   GET /api/trading/portfolio
exports.getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      return res.json({ success: true, portfolio: { holdings: [], totalInvested: 0, realizedPnl: 0 }, balance: user.virtualBalance });
    }

    res.json({ success: true, portfolio, balance: user.virtualBalance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
