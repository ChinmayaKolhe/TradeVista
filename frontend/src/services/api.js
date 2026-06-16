import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tv_token');
      localStorage.removeItem('tv_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// Market
export const marketAPI = {
  getTrending: (exchange) => API.get(`/market/trending${exchange ? `?exchange=${exchange}` : ''}`),
  getOverview: () => API.get('/market/overview'),
  search: (q) => API.get(`/market/search?q=${q}`),
  getQuote: (symbol) => API.get(`/market/quote/${symbol}`),
  getCandles: (symbol, interval = '1day', outputsize = 90) =>
    API.get(`/market/candles/${symbol}?interval=${interval}&outputsize=${outputsize}`),
};

// Trading
export const tradingAPI = {
  executeTrade: (data) => API.post('/trading/execute', data),
  getOrders: () => API.get('/trading/orders'),
  getPortfolio: () => API.get('/trading/portfolio'),
};

// Portfolio
export const portfolioAPI = {
  get: () => API.get('/portfolio'),
};

// Watchlist
export const watchlistAPI = {
  get: () => API.get('/watchlist'),
  add: (data) => API.post('/watchlist/add', data),
  remove: (symbol) => API.delete(`/watchlist/remove/${symbol}`),
};

// Sentiment
export const sentimentAPI = {
  getMarket: () => API.get('/sentiment/market'),
  getStock: (symbol) => API.get(`/sentiment/${symbol}`),
};

// Prediction
export const predictionAPI = {
  get: (symbol, price) => API.get(`/prediction/${symbol}?price=${price}`),
  getRecent: () => API.get('/prediction/recent'),
};

// Journal
export const journalAPI = {
  create: (data) => API.post('/journal', data),
  getAll: (params) => API.get('/journal', { params }),
  getAnalytics: () => API.get('/journal/analytics'),
  update: (id, data) => API.put(`/journal/${id}`, data),
  delete: (id) => API.delete(`/journal/${id}`),
};

export default API;
