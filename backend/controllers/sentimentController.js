const axios = require('axios');

const HF_KEY = process.env.HUGGINGFACE_API_KEY;

const mockNewsData = {
  AAPL: [
    { title: 'Apple Reports Record Q4 Earnings, Services Revenue Hits All-Time High', sentiment: 'positive', score: 0.92 },
    { title: 'Apple Vision Pro Shipments Beat Analyst Expectations', sentiment: 'positive', score: 0.87 },
    { title: 'iPhone 15 Demand Remains Strong Heading Into Holiday Season', sentiment: 'positive', score: 0.78 },
    { title: 'Apple Faces EU Antitrust Investigation Over App Store Practices', sentiment: 'negative', score: 0.65 },
  ],
  TSLA: [
    { title: 'Tesla Cuts Prices Again Amid Rising Competition From Chinese EVs', sentiment: 'negative', score: 0.72 },
    { title: 'Tesla FSD Beta Version 12 Shows Major Improvements in Urban Driving', sentiment: 'positive', score: 0.81 },
    { title: 'Tesla Cybertruck Production Ramp Up Faces Supply Chain Challenges', sentiment: 'negative', score: 0.68 },
    { title: 'Tesla Opens New Gigafactory in Mexico, Boosting Production Capacity', sentiment: 'positive', score: 0.76 },
  ],
  NVDA: [
    { title: 'NVIDIA H100 GPU Demand Continues to Outpace Supply', sentiment: 'positive', score: 0.95 },
    { title: 'NVIDIA Partners With Leading Cloud Providers for AI Infrastructure', sentiment: 'positive', score: 0.89 },
    { title: 'NVIDIA Reports Record Data Center Revenue, Stock Hits All-Time High', sentiment: 'positive', score: 0.97 },
  ],
};

const generateMockSentiment = (symbol) => {
  const news = mockNewsData[symbol.toUpperCase()] || [
    { title: `${symbol} Announces Strategic Partnership to Boost Growth`, sentiment: 'positive', score: 0.75 },
    { title: `Analysts Upgrade ${symbol} to Buy Rating`, sentiment: 'positive', score: 0.82 },
    { title: `${symbol} Q3 Results Beat Estimates on Strong Demand`, sentiment: 'positive', score: 0.71 },
    { title: `${symbol} Faces Headwinds From Macro Economic Uncertainty`, sentiment: 'negative', score: 0.63 },
  ];

  const positiveNews = news.filter((n) => n.sentiment === 'positive');
  const negativeNews = news.filter((n) => n.sentiment === 'negative');
  const positiveScore = positiveNews.length / news.length;

  return {
    symbol: symbol.toUpperCase(),
    overallSentiment: positiveScore > 0.6 ? 'POSITIVE' : positiveScore < 0.4 ? 'NEGATIVE' : 'NEUTRAL',
    positivePercent: Math.round(positiveScore * 100),
    negativePercent: Math.round((1 - positiveScore) * 100),
    newsCount: news.length,
    news,
    topDriver: positiveNews[0]?.title || negativeNews[0]?.title || 'Market activity normal',
    confidence: Math.round((news.reduce((acc, n) => acc + n.score, 0) / news.length) * 100),
  };
};

// @desc    Get sentiment for a stock
// @route   GET /api/sentiment/:symbol
exports.getStockSentiment = async (req, res) => {
  try {
    const { symbol } = req.params;
    const sentiment = generateMockSentiment(symbol);
    res.json({ success: true, sentiment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get overall market sentiment
// @route   GET /api/sentiment/market
exports.getMarketSentiment = async (req, res) => {
  try {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA'];
    const sentiments = symbols.map((s) => generateMockSentiment(s));

    const avgPositive = sentiments.reduce((acc, s) => acc + s.positivePercent, 0) / sentiments.length;
    const overallMood = avgPositive > 60 ? 'BULLISH' : avgPositive < 40 ? 'BEARISH' : 'NEUTRAL';

    res.json({
      success: true,
      market: {
        overallMood,
        avgPositivePercent: Math.round(avgPositive),
        fearGreedIndex: Math.round(avgPositive),
        stockSentiments: sentiments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
