import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { marketAPI, tradingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Format as Indian Rupee
const inr = (val, decimals = 2) =>
  `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

const QUICK_STOCKS = [
  { symbol: 'RELIANCE.NS', label: 'RELIANCE' },
  { symbol: 'TCS.NS', label: 'TCS' },
  { symbol: 'INFY.NS', label: 'INFY' },
  { symbol: 'HDFCBANK.NS', label: 'HDFC BANK' },
  { symbol: 'SBIN.NS', label: 'SBI' },
  { symbol: 'TATAMOTORS.NS', label: 'TATA MOTORS' },
  { symbol: 'AAPL', label: 'APPLE' },
  { symbol: 'NVDA', label: 'NVIDIA' },
];

export default function TradingPage() {
  const { symbol: paramSymbol } = useParams();
  const { balance, setBalance } = useAuth();
  const [symbol, setSymbol] = useState(paramSymbol || 'RELIANCE.NS');
  const [inputSymbol, setInputSymbol] = useState(paramSymbol || 'RELIANCE.NS');
  const [quote, setQuote] = useState(null);
  const [candles, setCandles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ type: 'BUY', quantity: 1 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setQuoteLoading(true);
      const [qRes, cRes, oRes] = await Promise.all([
        marketAPI.getQuote(symbol),
        marketAPI.getCandles(symbol, '1day', 30),
        tradingAPI.getOrders(),
      ]);
      setQuote(qRes.data.quote);
      setCandles(cRes.data.candles || []);
      setOrders(oRes.data.orders?.filter(o => o.symbol === symbol.toUpperCase()).slice(0, 10) || []);
    } catch (e) { console.error(e); }
    finally { setQuoteLoading(false); }
  }, [symbol]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSymbol(inputSymbol.toUpperCase());
  };

  const handleTrade = async () => {
    if (!form.quantity || form.quantity < 1) return setMsg({ type: 'error', text: 'Enter a valid quantity' });
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await tradingAPI.executeTrade({
        symbol,
        type: form.type,
        quantity: parseInt(form.quantity),
        price: quote?.price,
        companyName: quote?.name || symbol,
      });
      setMsg({ type: 'success', text: data.message });
      setBalance(data.newBalance);
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Trade failed' });
    } finally {
      setLoading(false);
    }
  };

  const totalCost = form.quantity * (quote?.price || 0);
  const chartData = candles.map(c => ({ date: c.datetime?.slice(5), price: parseFloat(c.close) }));
  const isIndian = symbol.endsWith('.NS') || symbol.endsWith('.BSE');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Trading Simulator</h1>
        <p style={{ color: '#8b949e', fontSize: 14 }}>Execute virtual trades with real market data — Indian & Global stocks in ₹</p>
      </div>

      {/* Quick Select Stocks */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {QUICK_STOCKS.map(({ symbol: s, label }) => (
          <button
            key={s}
            onClick={() => { setSymbol(s); setInputSymbol(s); }}
            style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${symbol === s ? '#ff6b35' : '#30363d'}`,
              background: symbol === s ? 'rgba(255,107,53,0.12)' : '#161b22',
              color: symbol === s ? '#ff6b35' : '#8b949e',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          {/* Symbol Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input
              value={inputSymbol}
              onChange={e => setInputSymbol(e.target.value.toUpperCase())}
              placeholder="NSE: RELIANCE.NS · TATAMOTORS.NS · or US: AAPL"
              style={{ flex: 1, padding: '10px 16px', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 13, outline: 'none' }}
            />
            <button type="submit" style={{ padding: '10px 20px', background: '#ff6b35', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Search</button>
          </form>

          {/* Quote Card */}
          {quoteLoading ? (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 24, marginBottom: 20, color: '#8b949e' }}>Loading quote...</div>
          ) : quote && (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#e6edf3' }}>{symbol}</div>
                    <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: isIndian ? 'rgba(255,107,53,0.12)' : 'rgba(88,166,255,0.12)', color: isIndian ? '#ff6b35' : '#58a6ff' }}>
                      {isIndian ? '🇮🇳 NSE' : '🌐 NASDAQ'}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: '#8b949e', marginTop: 2 }}>{quote.name || 'Stock'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#e6edf3' }}>{inr(quote.price)}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: (quote.change || 0) >= 0 ? '#3fb950' : '#f85149' }}>
                    {(quote.change || 0) >= 0 ? '▲' : '▼'} {inr(Math.abs(quote.change || 0))} ({Math.abs(quote.changePercent || 0).toFixed(2)}%)
                  </div>
                </div>
              </div>
              {(quote.high || quote.low || quote.open) && (
                <div style={{ display: 'flex', gap: 24, marginTop: 16, paddingTop: 16, borderTop: '1px solid #30363d' }}>
                  {[['Open', quote.open], ['High', quote.high], ['Low', quote.low], ['Prev Close', quote.prevClose]].map(([label, val]) => val && (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: '#6e7681' }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#e6edf3' }}>{inr(val)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price Chart */}
          {chartData.length > 0 && (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Price History (30 Days)</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fill: '#6e7681', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6e7681', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8 }} formatter={v => [inr(v), 'Price']} />
                  <Line type="monotone" dataKey="price" stroke="#ff6b35" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Order History */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Orders for {symbol}</div>
            {orders.length === 0 ? (
              <div style={{ color: '#8b949e', fontSize: 14, padding: '16px 0' }}>No orders for this symbol yet</div>
            ) : orders.map(o => (
              <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #21262d' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: o.type === 'BUY' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)', color: o.type === 'BUY' ? '#3fb950' : '#f85149' }}>{o.type}</span>
                  <div>
                    <div style={{ fontSize: 13, color: '#e6edf3' }}>{o.quantity} shares @ {inr(o.price)}</div>
                    <div style={{ fontSize: 11, color: '#6e7681' }}>{new Date(o.createdAt).toLocaleString('en-IN')}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{inr(o.totalAmount)}</div>
                  {o.pnl !== 0 && <div style={{ fontSize: 11, color: o.pnl >= 0 ? '#3fb950' : '#f85149' }}>P&L: {o.pnl >= 0 ? '+' : ''}{inr(o.pnl)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Panel */}
        <div>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 24, position: 'sticky', top: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3', marginBottom: 20 }}>Execute Trade</div>

            {/* Balance */}
            <div style={{ background: '#0d1117', borderRadius: 8, padding: '12px 16px', marginBottom: 20, border: '1px solid rgba(255,107,53,0.15)' }}>
              <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4 }}>Virtual Purse 👜</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#ff6b35' }}>{inr(balance)}</div>
              <div style={{ fontSize: 11, color: '#6e7681', marginTop: 2 }}>Available balance</div>
            </div>

            {/* Buy / Sell Toggle */}
            <div style={{ display: 'flex', background: '#0d1117', borderRadius: 8, padding: 4, marginBottom: 20 }}>
              {['BUY', 'SELL'].map(t => (
                <button key={t} onClick={() => setForm({ ...form, type: t })} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: 'pointer', background: form.type === t ? (t === 'BUY' ? '#3fb950' : '#f85149') : 'transparent', color: form.type === t ? '#fff' : '#8b949e', transition: 'all 0.15s' }}>
                  {t === 'BUY' ? '📈 BUY' : '📉 SELL'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#8b949e', marginBottom: 6 }}>Quantity (Shares)</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #30363d', borderBottom: '1px solid #30363d', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#8b949e' }}>Market Price</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3' }}>{inr(quote?.price || 0)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#8b949e' }}>Total {form.type === 'BUY' ? 'Cost' : 'Proceeds'}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: form.type === 'BUY' ? '#f85149' : '#3fb950' }}>{inr(totalCost)}</div>
              </div>
            </div>

            {msg && (
              <div style={{ background: msg.type === 'success' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', border: `1px solid ${msg.type === 'success' ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: msg.type === 'success' ? '#3fb950' : '#f85149', fontSize: 13 }}>
                {msg.text}
              </div>
            )}

            <button
              onClick={handleTrade}
              disabled={loading || !quote}
              style={{ width: '100%', padding: 14, background: loading ? '#21262d' : form.type === 'BUY' ? '#3fb950' : '#f85149', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Processing...' : `${form.type === 'BUY' ? '📈 BUY' : '📉 SELL'} ${form.quantity} Share${form.quantity > 1 ? 's' : ''}`}
            </button>

            <div style={{ fontSize: 11, color: '#6e7681', textAlign: 'center', marginTop: 10 }}>
              🛡️ Virtual trading only — no real money involved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
