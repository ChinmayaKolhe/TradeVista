const axios = require('axios');

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const TWELVE_KEY = process.env.TWELVE_DATA_API_KEY;

// Approximate USD→INR conversion rate (static for virtual trading)
const USD_TO_INR = 83.5;

// Indian (NSE) stocks — prices in INR
const indianStocks = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', price: 2987.45, change: 34.20, changePercent: 1.16, volume: 8234500, sector: 'Energy', exchange: 'NSE', currency: 'INR' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: 3812.30, change: -28.50, changePercent: -0.74, volume: 3456700, sector: 'Technology', exchange: 'NSE', currency: 'INR' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd.', price: 1654.75, change: 22.10, changePercent: 1.35, volume: 5678900, sector: 'Technology', exchange: 'NSE', currency: 'INR' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', price: 1723.60, change: 15.40, changePercent: 0.90, volume: 6789012, sector: 'Financial', exchange: 'NSE', currency: 'INR' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd.', price: 1245.30, change: -8.70, changePercent: -0.69, volume: 9012345, sector: 'Financial', exchange: 'NSE', currency: 'INR' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd.', price: 7234.50, change: 112.30, changePercent: 1.58, volume: 2345678, sector: 'Financial', exchange: 'NSE', currency: 'INR' },
  { symbol: 'WIPRO.NS', name: 'Wipro Ltd.', price: 478.90, change: -5.20, changePercent: -1.07, volume: 4567890, sector: 'Technology', exchange: 'NSE', currency: 'INR' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd.', price: 912.45, change: 18.75, changePercent: 2.10, volume: 12345678, sector: 'Automobile', exchange: 'NSE', currency: 'INR' },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd.', price: 2634.70, change: -45.30, changePercent: -1.69, volume: 3456789, sector: 'Conglomerate', exchange: 'NSE', currency: 'INR' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', price: 834.20, change: 11.60, changePercent: 1.41, volume: 15678901, sector: 'Financial', exchange: 'NSE', currency: 'INR' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd.', price: 12456.80, change: 234.50, changePercent: 1.92, volume: 876543, sector: 'Automobile', exchange: 'NSE', currency: 'INR' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', price: 1567.30, change: -12.40, changePercent: -0.78, volume: 3214567, sector: 'Pharma', exchange: 'NSE', currency: 'INR' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd.', price: 2345.60, change: 28.90, changePercent: 1.25, volume: 2109876, sector: 'FMCG', exchange: 'NSE', currency: 'INR' },
  { symbol: 'LTIM.NS', name: 'LTIMindtree Ltd.', price: 5234.70, change: 87.30, changePercent: 1.70, volume: 987654, sector: 'Technology', exchange: 'NSE', currency: 'INR' },
  { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corp.', price: 287.45, change: 4.30, changePercent: 1.52, volume: 18765432, sector: 'Energy', exchange: 'NSE', currency: 'INR' },
];

// US stocks — prices stored in INR equivalent (USD * rate)
const usStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: +(189.84 * USD_TO_INR).toFixed(2), change: +(1.23 * USD_TO_INR).toFixed(2), changePercent: 0.65, volume: 52341200, sector: 'Technology', exchange: 'NASDAQ', currency: 'INR' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: +(141.96 * USD_TO_INR).toFixed(2), change: +(-0.54 * USD_TO_INR).toFixed(2), changePercent: -0.38, volume: 18234500, sector: 'Technology', exchange: 'NASDAQ', currency: 'INR' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: +(374.51 * USD_TO_INR).toFixed(2), change: +(2.11 * USD_TO_INR).toFixed(2), changePercent: 0.57, volume: 21456700, sector: 'Technology', exchange: 'NASDAQ', currency: 'INR' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: +(178.25 * USD_TO_INR).toFixed(2), change: +(3.45 * USD_TO_INR).toFixed(2), changePercent: 1.97, volume: 34567800, sector: 'Consumer Cyclical', exchange: 'NASDAQ', currency: 'INR' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: +(248.42 * USD_TO_INR).toFixed(2), change: +(-5.67 * USD_TO_INR).toFixed(2), changePercent: -2.23, volume: 89012300, sector: 'Automotive', exchange: 'NASDAQ', currency: 'INR' },
  { symbol: 'META', name: 'Meta Platforms', price: +(484.10 * USD_TO_INR).toFixed(2), change: +(4.32 * USD_TO_INR).toFixed(2), changePercent: 0.90, volume: 14567900, sector: 'Technology', exchange: 'NASDAQ', currency: 'INR' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: +(627.30 * USD_TO_INR).toFixed(2), change: +(12.45 * USD_TO_INR).toFixed(2), changePercent: 2.02, volume: 43210900, sector: 'Technology', exchange: 'NASDAQ', currency: 'INR' },
];

const allMockStocks = [...indianStocks, ...usStocks];

// @desc    Get market movers / trending stocks
// @route   GET /api/market/trending
exports.getTrending = async (req, res) => {
  try {
    const { exchange } = req.query; // 'NSE', 'NASDAQ', or undefined for all
    let stocks = allMockStocks
      .map((s) => ({ ...s, price: +(s.price + (Math.random() - 0.5) * (s.exchange === 'NSE' ? 20 : 400)).toFixed(2) }))
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

    if (exchange && exchange !== 'ALL') {
      stocks = stocks.filter(s => s.exchange === exchange);
    }

    res.json({ success: true, stocks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stock quote
// @route   GET /api/market/quote/:symbol
exports.getQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    const isIndian = symbol.endsWith('.NS') || symbol.endsWith('.BSE');

    if (!isIndian && FINNHUB_KEY && FINNHUB_KEY !== 'your_finnhub_api_key') {
      const { data } = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
      return res.json({
        success: true,
        quote: {
          symbol,
          price: +(data.c * USD_TO_INR).toFixed(2),
          change: +(data.d * USD_TO_INR).toFixed(2),
          changePercent: data.dp,
          high: +(data.h * USD_TO_INR).toFixed(2),
          low: +(data.l * USD_TO_INR).toFixed(2),
          open: +(data.o * USD_TO_INR).toFixed(2),
          prevClose: +(data.pc * USD_TO_INR).toFixed(2),
          currency: 'INR',
          exchange: 'NASDAQ',
        },
      });
    }

    // Fallback mock data
    const mock = allMockStocks.find((s) => s.symbol === symbol.toUpperCase() || s.symbol === symbol) || {
      symbol,
      price: isIndian ? +(500 + Math.random() * 2000).toFixed(2) : +((100 + Math.random() * 300) * USD_TO_INR).toFixed(2),
      change: +((Math.random() - 0.5) * (isIndian ? 30 : 400)).toFixed(2),
      changePercent: +((Math.random() - 0.5) * 3).toFixed(2),
      currency: 'INR',
      exchange: isIndian ? 'NSE' : 'NASDAQ',
    };
    res.json({ success: true, quote: { ...mock, price: +(mock.price + (Math.random() - 0.5) * 10).toFixed(2) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get candle/historical data
// @route   GET /api/market/candles/:symbol
exports.getCandles = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1day', outputsize = 90 } = req.query;
    const isIndian = symbol.endsWith('.NS') || symbol.endsWith('.BSE');

    if (!isIndian && TWELVE_KEY && TWELVE_KEY !== 'your_twelve_data_api_key') {
      const { data } = await axios.get(
        `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVE_KEY}`
      );
      if (data.status === 'ok') {
        const candles = data.values.reverse().map(c => ({
          ...c,
          open: +(parseFloat(c.open) * USD_TO_INR).toFixed(2),
          high: +(parseFloat(c.high) * USD_TO_INR).toFixed(2),
          low: +(parseFloat(c.low) * USD_TO_INR).toFixed(2),
          close: +(parseFloat(c.close) * USD_TO_INR).toFixed(2),
        }));
        return res.json({ success: true, candles });
      }
    }

    // Generate mock OHLCV data in INR
    const basePrice = (allMockStocks.find(s => s.symbol === symbol || s.symbol === symbol.toUpperCase())?.price) ||
      (isIndian ? 1500 : 200 * USD_TO_INR);

    const candles = [];
    let price = basePrice;
    const now = Date.now();
    for (let i = outputsize; i >= 0; i--) {
      const open = price;
      const volatility = isIndian ? 40 : 400;
      const change = (Math.random() - 0.48) * volatility;
      const close = +(open + change).toFixed(2);
      const high = +(Math.max(open, close) + Math.random() * (volatility / 4)).toFixed(2);
      const low = +(Math.min(open, close) - Math.random() * (volatility / 4)).toFixed(2);
      const volume = Math.floor(Math.random() * 10000000 + 1000000);
      const date = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      candles.push({ datetime: date, open: +open.toFixed(2), high, low, close, volume });
      price = close;
    }

    res.json({ success: true, candles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search stocks
// @route   GET /api/market/search
exports.searchStocks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, results: [] });

    const results = allMockStocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q.toLowerCase()) ||
        s.name.toLowerCase().includes(q.toLowerCase())
    );

    if (FINNHUB_KEY && FINNHUB_KEY !== 'your_finnhub_api_key' && results.length === 0) {
      const { data } = await axios.get(`https://finnhub.io/api/v1/search?q=${q}&token=${FINNHUB_KEY}`);
      return res.json({ success: true, results: (data.result || []).slice(0, 10) });
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get market overview (Indian indices)
// @route   GET /api/market/overview
exports.getMarketOverview = async (req, res) => {
  try {
    const indices = [
      { name: 'NIFTY 50', value: 24320.15, change: 143.25, changePercent: 0.59 },
      { name: 'SENSEX', value: 79986.80, change: 452.40, changePercent: 0.57 },
      { name: 'BANK NIFTY', value: 52345.70, change: -234.50, changePercent: -0.45 },
      { name: 'NIFTY IT', value: 38456.30, change: 312.80, changePercent: 0.82 },
      { name: 'NIFTY MIDCAP', value: 56234.45, change: 189.30, changePercent: 0.34 },
      { name: 'NIFTY PHARMA', value: 21345.60, change: -87.20, changePercent: -0.41 },
    ];
    res.json({ success: true, indices, topStocks: allMockStocks.slice(0, 6) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
