# TradeVista — India Virtual Trading Simulator

TradeVista is a full-stack MERN (MongoDB, Express, React, Node.js) web application that simulates real-world stock trading for the Indian market. Users register with a custom virtual purse amount in Indian Rupees (₹), then buy and sell Indian (NSE) and US (NASDAQ) stocks using virtual money - with no real funds involved. The platform includes AI-powered sentiment analysis, Groq LLM price predictions, interactive technical charts, a trade journal, and a live watchlist.

---

## Project Overview

TradeVista is designed for Indian traders and learners who want to practice stock trading without financial risk - similar to Groww or Zerodha paper trading, but with AI intelligence built in.

**Key highlights:**

- All prices displayed in Indian Rupees (₹) with Indian locale formatting (en-IN)
- Supports NSE Indian stocks (RELIANCE.NS, TCS.NS, INFY.NS, etc.) and US stocks (AAPL, NVDA, etc.)
- Flexible virtual purse — user chooses their starting capital (₹50K to ₹1 Crore) at registration
- Indian market indices on dashboard — NIFTY 50, SENSEX, BANK NIFTY, NIFTY IT, NIFTY MIDCAP, NIFTY PHARMA
- AI sentiment analysis on market news via Hugging Face models
- AI price predictions powered by Groq LLM (Llama 3)
- Real-time price streaming via Socket.io WebSockets
- JWT-secured authentication with protected routes

---

## File & Folder Description

```
tradevista/
│
├── package.json                        # Root scripts: npm run dev (runs both servers)
│
├── backend/
│   ├── server.js                       # Express app entry point, Socket.io setup, route mounting
│   ├── .env                            # Environment variables (MongoDB URI, JWT secret, API keys)
│   │
│   ├── config/
│   │   └── db.js                       # MongoDB Atlas connection via Mongoose
│   │
│   ├── controllers/
│   │   ├── authController.js           # User register (with custom ₹ balance), login, get profile
│   │   ├── marketController.js         # Indian + US stock quotes, candles, trending, search, NSE indices
│   │   ├── tradingController.js        # Buy/sell execution engine, balance deduction, P&L calculation
│   │   ├── portfolioController.js      # Fetch user portfolio holdings and performance
│   │   ├── sentimentController.js      # Hugging Face sentiment analysis on stock news
│   │   ├── predictionController.js     # Groq LLM (Llama 3) directional price forecasting
│   │   ├── journalController.js        # Trade journal CRUD + AI-generated insights
│   │   └── watchlistController.js      # Add/remove stocks from personal watchlist
│   │
│   ├── middleware/
│   │   └── auth.js                     # JWT token verification middleware (protects private routes)
│   │
│   ├── models/
│   │   ├── User.js                     # User schema — name, email, hashed password, virtualBalance (₹)
│   │   ├── Portfolio.js                # Holdings array, totalInvested, realizedPnl
│   │   ├── Order.js                    # Individual buy/sell order records
│   │   ├── Watchlist.js                # User's watchlist of stock symbols
│   │   ├── Journal.js                  # Trade journal entries with emotion tags and AI insights
│   │   └── Prediction.js              # Cached AI prediction results per symbol
│   │
│   └── routes/
│       ├── auth.js                     # /api/auth — register, login, profile
│       ├── market.js                   # /api/market — trending, quote, candles, search, overview
│       ├── trading.js                  # /api/trading — execute trade, orders, portfolio
│       ├── portfolio.js                # /api/portfolio — user portfolio
│       ├── sentiment.js                # /api/sentiment — market mood, stock sentiment
│       ├── prediction.js               # /api/prediction — AI price forecast
│       ├── journal.js                  # /api/journal — trade journal
│       └── watchlist.js                # /api/watchlist — watchlist management
│
└── frontend/
    ├── public/
    │   └── index.html                  # HTML shell
    │
    └── src/
        ├── index.js                    # React DOM render entry point
        ├── App.js                      # React Router setup, protected route guard
        │
        ├── context/
        │   └── AuthContext.js          # Global auth state — user, balance (₹), login, register, logout
        │
        ├── services/
        │   ├── api.js                  # Axios instance with JWT interceptor + all API call functions
        │   └── socket.js               # Socket.io client for real-time price streaming
        │
        ├── components/
        │   └── Layout/
        │       └── Layout.js           # App shell — collapsible sidebar, nav links, ₹ balance display
        │
        └── pages/
            ├── LoginPage.js            # Email + password login form
            ├── RegisterPage.js         # 2-step registration: account info → virtual purse setup (₹ presets)
            ├── DashboardPage.js        # Overview — portfolio stats, Indian indices, recent orders, charts
            ├── MarketPage.js           # Market scanner — NSE/NASDAQ tabs, stock table in ₹, gainers/losers
            ├── TradingPage.js          # Trade execution — stock search, quote card, price chart, buy/sell panel
            ├── PortfolioPage.js        # Holdings table with ₹ values, P&L, exchange badges (NSE / US)
            ├── ChartsPage.js           # Technical analysis — candlestick chart, SMA20, SMA50, RSI, Volume
            ├── SentimentPage.js        # AI sentiment dashboard — news classification, market mood index
            ├── PredictionPage.js       # AI prediction engine — Groq LLM forecast, confidence score, targets in ₹
            ├── JournalPage.js          # Trade journal — log trades, tag emotions, view AI insights
            └── WatchlistPage.js        # Personal watchlist — add/remove stocks, live ₹ prices
```

---

## Setup Instructions

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB Atlas** account (free tier works)
- API keys are **optional** — the app runs with built-in mock data for all features

---

### Step 1 — Clone the repository and install dependencies

```bash
git clone <repo-url>
cd tradevista
npm run install:all
```

This installs dependencies for the root, backend, and frontend in one command.

---

### Step 2 — Configure environment variables

**Backend** — create `backend/.env` (copy from the example):

```bash
cp backend/.env.example backend/.env
```

Then fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/tradevista
JWT_SECRET=your_long_random_secret_key
JWT_EXPIRE=7d

# Optional — app uses mock data without these
FINNHUB_API_KEY=your_finnhub_key
TWELVE_DATA_API_KEY=your_twelve_data_key
GROQ_API_KEY=your_groq_key
HUGGINGFACE_API_KEY=your_huggingface_key

CLIENT_URL=http://localhost:3000
```

**Frontend** — create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

### Step 3 — Start the development servers

```bash
# Run frontend and backend together
npm run dev
```

Or run separately:

```bash
npm run dev:backend    # Backend server → http://localhost:5000
npm run dev:frontend   # React app     → http://localhost:3000
```

---

### Step 4 — Register and start trading

1. Open `http://localhost:3000` in your browser
2. Click **Create Account**
3. Fill in your name, email, and password
4. On the next step, choose your **virtual purse amount** in ₹ — from ₹50,000 to ₹1 Crore (or enter a custom amount)
5. Click **Start Trading** — you land on the dashboard
6. Go to **Trading** and search for Indian stocks like `RELIANCE.NS`, `TCS.NS`, `INFY.NS`, or US stocks like `AAPL`, `NVDA`
7. Buy/sell shares from your virtual ₹ balance with no real money involved

---

### Free API Keys (Optional)

| Service | URL | Free Tier |
|---|---|---|
| Finnhub | https://finnhub.io | 60 requests/min |
| Twelve Data | https://twelvedata.com | 800 requests/day |
| Groq | https://console.groq.com | Generous free tier |
| Hugging Face | https://huggingface.co | Free inference API |
| MongoDB Atlas | https://mongodb.com/atlas | 512 MB free storage |

Without any API keys, the app uses built-in mock data that covers all Indian and US stocks, indices, and AI predictions.
