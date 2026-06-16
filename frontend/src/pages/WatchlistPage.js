import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchlistAPI, marketAPI } from '../services/api';

const inr = (val, decimals = 2) =>
  `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

export default function WatchlistPage() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [symbol, setSymbol] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadWatchlist = async () => {
    try {
      const { data } = await watchlistAPI.get();
      const stocks = data.watchlist?.stocks || [];
      setWatchlist(stocks);
      // Fetch quotes for all stocks
      const quoteMap = {};
      await Promise.all(stocks.map(async (s) => {
        try {
          const { data: qData } = await marketAPI.getQuote(s.symbol);
          quoteMap[s.symbol] = qData.quote;
        } catch (e) {}
      }));
      setQuotes(quoteMap);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadWatchlist(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    setAdding(true);
    setMsg(null);
    try {
      await watchlistAPI.add({ symbol: symbol.toUpperCase(), companyName });
      setSymbol('');
      setCompanyName('');
      setMsg({ type: 'success', text: `${symbol.toUpperCase()} added to watchlist` });
      loadWatchlist();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add stock' });
    } finally { setAdding(false); }
  };

  const handleRemove = async (sym) => {
    try {
      await watchlistAPI.remove(sym);
      setWatchlist(watchlist.filter(s => s.symbol !== sym));
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Watchlist</h1>
        <p style={{ color: '#8b949e', fontSize: 14 }}>Monitor your favourite Indian & global stocks — all prices in ₹</p>
      </div>

      {/* Add Stock Form */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>Add Stock to Watchlist</div>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
            placeholder="NSE: RELIANCE.NS, TCS.NS · US: AAPL"
            required
            style={{ padding: '10px 14px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none', width: 160 }}
          />
          <input
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Company name (optional)"
            style={{ padding: '10px 14px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none', flex: 1, minWidth: 180 }}
          />
          <button type="submit" disabled={adding} style={{ padding: '10px 20px', background: adding ? '#21262d' : '#58a6ff', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: adding ? 'not-allowed' : 'pointer' }}>
            {adding ? 'Adding...' : '+ Add'}
          </button>
        </form>
        {msg && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: msg.type === 'success' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', border: `1px solid ${msg.type === 'success' ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, borderRadius: 6, fontSize: 13, color: msg.type === 'success' ? '#3fb950' : '#f85149' }}>
            {msg.text}
          </div>
        )}
      </div>

      {/* Watchlist Table */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #30363d', fontSize: 15, fontWeight: 600, color: '#e6edf3' }}>
          Watching ({watchlist.length})
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8b949e' }}>Loading watchlist...</div>
        ) : watchlist.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8b949e' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👁</div>
            <div>No stocks in watchlist yet. Add one above!</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 120px', padding: '10px 20px', borderBottom: '1px solid #30363d', fontSize: 11, color: '#6e7681', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>Symbol</span><span>Price</span><span>Change</span><span>% Change</span><span>Added</span><span>Actions</span>
            </div>
            {watchlist.map(stock => {
              const q = quotes[stock.symbol];
              const change = q?.change || 0;
              const changePct = q?.changePercent || 0;
              return (
                <div key={stock.symbol} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 120px', padding: '14px 20px', borderBottom: '1px solid #21262d', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#e6edf3', fontSize: 14 }}>{stock.symbol}</div>
                    <div style={{ fontSize: 11, color: '#8b949e' }}>{stock.companyName}</div>
                  </div>
                  <div style={{ fontWeight: 600, color: '#e6edf3' }}>
                    {q ? inr(q.price) : <span style={{ color: '#6e7681' }}>Loading...</span>}
                  </div>
                  <div style={{ color: change >= 0 ? '#3fb950' : '#f85149', fontWeight: 500 }}>
                    {q ? `${change >= 0 ? '+' : ''}${inr(change)}` : '—'}
                  </div>
                  <div style={{ color: changePct >= 0 ? '#3fb950' : '#f85149', fontWeight: 600 }}>
                    {q ? `${changePct >= 0 ? '▲' : '▼'} ${Math.abs(changePct).toFixed(2)}%` : '—'}
                  </div>
                  <div style={{ fontSize: 12, color: '#8b949e' }}>
                    {new Date(stock.addedAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => navigate(`/trading/${stock.symbol}`)} style={{ padding: '5px 10px', background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 6, color: '#58a6ff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Trade</button>
                    <button onClick={() => navigate(`/charts/${stock.symbol}`)} style={{ padding: '5px 10px', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', cursor: 'pointer', fontSize: 12 }}>Chart</button>
                    <button onClick={() => handleRemove(stock.symbol)} style={{ padding: '5px 8px', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 6, color: '#f85149', cursor: 'pointer', fontSize: 12 }}>✕</button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
