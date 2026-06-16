import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketAPI } from '../services/api';

const inr = (val, decimals = 2) =>
  `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

const EXCHANGE_TABS = [
  { key: 'ALL', label: '🌐 All Stocks' },
  { key: 'NSE', label: '🇮🇳 NSE (India)' },
  { key: 'NASDAQ', label: '🇺🇸 NASDAQ (US)' },
];

export default function MarketPage() {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [exchange, setExchange] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await marketAPI.getTrending(exchange !== 'ALL' ? exchange : undefined);
        setStocks(data.stocks || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [exchange]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await marketAPI.search(search);
        setSearchResults(data.results || []);
      } catch (e) { console.error(e); }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const displayed = search ? searchResults : stocks.filter(s => {
    if (filter === 'gainers') return s.changePercent > 0;
    if (filter === 'losers') return s.changePercent < 0;
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Market Scanner</h1>
        <p style={{ color: '#8b949e', fontSize: 14 }}>Real-time Indian & global stock data — all prices in ₹ (Rupees)</p>
      </div>

      {/* Exchange Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {EXCHANGE_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setExchange(key)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: exchange === key ? 700 : 400, cursor: 'pointer',
              border: `1.5px solid ${exchange === key ? '#ff6b35' : '#30363d'}`,
              background: exchange === key ? 'rgba(255,107,53,0.12)' : '#161b22',
              color: exchange === key ? '#ff6b35' : '#8b949e', transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search — RELIANCE.NS, TCS, INFY, AAPL..."
          style={{ flex: 1, minWidth: 200, padding: '10px 16px', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none' }}
        />
        {['all', 'gainers', 'losers'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 18px', background: filter === f ? '#ff6b35' : '#161b22', border: `1px solid ${filter === f ? '#ff6b35' : '#30363d'}`, borderRadius: 8, color: filter === f ? '#fff' : '#8b949e', fontSize: 13, cursor: 'pointer', fontWeight: filter === f ? 600 : 400, textTransform: 'capitalize' }}>
            {f === 'all' ? 'All Stocks' : f === 'gainers' ? '📈 Gainers' : '📉 Losers'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 0.8fr', padding: '12px 20px', borderBottom: '1px solid #30363d', fontSize: 12, color: '#6e7681', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Symbol</span><span>Price (₹)</span><span>Change (₹)</span><span>% Change</span><span>Volume</span><span>Exchange</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8b949e' }}>Loading market data...</div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8b949e' }}>No stocks found</div>
        ) : displayed.map((stock) => {
          const isIndian = stock.exchange === 'NSE' || stock.symbol.endsWith('.NS');
          return (
            <div
              key={stock.symbol}
              onClick={() => navigate(`/trading/${stock.symbol}`)}
              style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 0.8fr', padding: '14px 20px', borderBottom: '1px solid #21262d', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#e6edf3', fontSize: 14 }}>{stock.symbol.replace('.NS', '').replace('.BSE', '')}</div>
                <div style={{ fontSize: 12, color: '#8b949e' }}>{stock.name || stock.companyName || ''}</div>
              </div>
              <div style={{ fontWeight: 600, color: '#e6edf3', display: 'flex', alignItems: 'center' }}>
                {inr(Number(stock.price || stock.c || 0))}
              </div>
              <div style={{ color: (stock.change || stock.d || 0) >= 0 ? '#3fb950' : '#f85149', display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                {(stock.change || stock.d || 0) >= 0 ? '+' : ''}{inr(Number(stock.change || stock.d || 0))}
              </div>
              <div style={{ color: (stock.changePercent || stock.dp || 0) >= 0 ? '#3fb950' : '#f85149', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                {(stock.changePercent || stock.dp || 0) >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent || stock.dp || 0).toFixed(2)}%
              </div>
              <div style={{ color: '#8b949e', display: 'flex', alignItems: 'center', fontSize: 13 }}>
                {stock.volume ? `${(stock.volume / 1e6).toFixed(1)}M` : 'N/A'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  padding: '3px 8px', borderRadius: 4, fontSize: 11,
                  background: isIndian ? 'rgba(255,107,53,0.1)' : 'rgba(88,166,255,0.1)',
                  color: isIndian ? '#ff6b35' : '#58a6ff',
                }}>
                  {isIndian ? '🇮🇳 NSE' : '🇺🇸 US'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
