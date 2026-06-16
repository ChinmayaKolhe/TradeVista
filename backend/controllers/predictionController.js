const axios = require('axios');
const Prediction = require('../models/Prediction');

const GROQ_KEY = process.env.GROQ_API_KEY;

const generateMockPrediction = (symbol, currentPrice) => {
  const rand = Math.random();
  const direction = rand > 0.55 ? 'BULLISH' : rand < 0.35 ? 'BEARISH' : 'NEUTRAL';
  const confidence = Math.floor(60 + Math.random() * 35);
  const targetMultiplier = direction === 'BULLISH' ? 1 + Math.random() * 0.08 : direction === 'BEARISH' ? 1 - Math.random() * 0.06 : 1;
  const targetPrice = +(currentPrice * targetMultiplier).toFixed(2);

  const reasoningMap = {
    BULLISH: [
      'Strong momentum in technical indicators with RSI showing oversold recovery.',
      'Increasing institutional buying pressure detected through volume analysis.',
      'Positive earnings surprise expected based on sector performance and guidance.',
    ],
    BEARISH: [
      'Overbought RSI levels and negative MACD crossover signal potential correction.',
      'Declining volume on recent up moves suggests weakening buying interest.',
      'Macro headwinds and valuation concerns may weigh on near-term performance.',
    ],
    NEUTRAL: [
      'Mixed signals from technical indicators suggest consolidation phase.',
      'Price trading in a range with no clear directional bias from volume patterns.',
      'Market awaiting catalyst — upcoming earnings report could determine next move.',
    ],
  };

  return {
    symbol: symbol.toUpperCase(),
    direction,
    confidence,
    currentPrice,
    targetPrice,
    reasoning: reasoningMap[direction][Math.floor(Math.random() * 3)],
    riskLevel: confidence > 80 ? 'LOW' : confidence > 65 ? 'MEDIUM' : 'HIGH',
    timeframe: '1 week',
    indicators: {
      rsi: +(30 + Math.random() * 60).toFixed(1),
      macd: +((Math.random() - 0.5) * 4).toFixed(2),
      bollingerPosition: direction === 'BULLISH' ? 'Near Lower Band' : direction === 'BEARISH' ? 'Near Upper Band' : 'Middle',
      volumeTrend: direction === 'BULLISH' ? 'Increasing' : direction === 'BEARISH' ? 'Decreasing' : 'Stable',
    },
  };
};

// @desc    Get prediction for a stock using Groq LLM or fallback
// @route   GET /api/prediction/:symbol
exports.getPrediction = async (req, res) => {
  try {
    const { symbol } = req.params;
    const currentPrice = parseFloat(req.query.price) || 150;

    // Try to get cached prediction (within last hour)
    const cached = await Prediction.findOne({
      symbol: symbol.toUpperCase(),
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    }).sort({ createdAt: -1 });

    if (cached) {
      return res.json({ success: true, prediction: cached, cached: true });
    }

    let predictionData;

    if (GROQ_KEY && GROQ_KEY !== 'your_groq_api_key') {
      try {
        const { data } = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama3-8b-8192',
            messages: [
              {
                role: 'system',
                content: 'You are a professional stock market analyst. Respond only in valid JSON format.',
              },
              {
                role: 'user',
                content: `Analyze ${symbol} stock at price $${currentPrice}. Return JSON with: direction (BULLISH/BEARISH/NEUTRAL), confidence (0-100), targetPrice, reasoning, riskLevel (LOW/MEDIUM/HIGH), timeframe.`,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          },
          { headers: { Authorization: `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' } }
        );

        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          predictionData = { symbol: symbol.toUpperCase(), currentPrice, ...parsed };
        }
      } catch (groqError) {
        console.log('Groq API error, using mock prediction:', groqError.message);
        predictionData = generateMockPrediction(symbol, currentPrice);
      }
    } else {
      predictionData = generateMockPrediction(symbol, currentPrice);
    }

    const prediction = await Prediction.create(predictionData);
    res.json({ success: true, prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent predictions
// @route   GET /api/prediction/recent
exports.getRecentPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, predictions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
