const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    res.json({ success: true, portfolio, balance: user.virtualBalance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;
