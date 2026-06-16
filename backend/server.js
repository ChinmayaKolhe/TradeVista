const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Attach io to request
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/market', require('./routes/market'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/trading', require('./routes/trading'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/sentiment', require('./routes/sentiment'));
app.use('/api/prediction', require('./routes/prediction'));
app.use('/api/journal', require('./routes/journal'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.io events
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('subscribe_stock', (symbol) => {
    socket.join(`stock_${symbol}`);
    console.log(`Socket ${socket.id} subscribed to ${symbol}`);
  });

  socket.on('unsubscribe_stock', (symbol) => {
    socket.leave(`stock_${symbol}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Simulate real-time price updates (replace with actual WebSocket feed in production)
const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
const priceCache = {};
stockSymbols.forEach((s) => (priceCache[s] = 150 + Math.random() * 200));

setInterval(() => {
  stockSymbols.forEach((symbol) => {
    const change = (Math.random() - 0.49) * 2;
    priceCache[symbol] = Math.max(1, priceCache[symbol] + change);
    io.to(`stock_${symbol}`).emit('price_update', {
      symbol,
      price: +priceCache[symbol].toFixed(2),
      change: +change.toFixed(2),
      changePercent: +((change / priceCache[symbol]) * 100).toFixed(2),
      timestamp: Date.now(),
    });
  });
}, 3000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 TradeVista server running on port ${PORT}`));
