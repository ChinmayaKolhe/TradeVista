import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const inr = (val, decimals = 2) =>
  `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

export default function PortfolioPage() {
  const { balance } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portfolioAPI.get().then(({ data }) => {
      setPortfolio(data.portfolio);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#8b949e', padding: 40, textAlign: 'center' }}>Loading portfolio...</div>;

  const holdings = portfolio?.holdings || [];
  const totalValue = holdings.reduce((a, h) => a + h.quantity * (h.currentPrice || h.avgBuyPrice), 0);
  const totalCost = holdings.reduce((a, h) => a + h.quantity * h.avgBuyPrice, 0);
  const unrealizedPnl = totalValue - totalCost;
  const realizedPnl = portfolio?.realizedPnl || 0;
  const totalPortfolio = balance + totalValue;

  const chartData = holdings.map(h => ({
    symbol: h.symbol.replace('.NS', '').replace('.BSE', ''),
    value: +(h.quantity * (h.currentPrice || h.avgBuyPrice)).toFixed(2),
    pnl: +((h.currentPrice || h.avgBuyPrice) - h.avgBuyPrice).toFixed(2),
  }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Portfolio Analytics</h1>
        <p style={{ color: '#8b949e', fontSize: 14 }}>Track your holdings and performance in ₹</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Portfolio', value: inr(totalPortfolio), color: '#ff6b35', icon: '💼' },
          { label: 'Virtual Purse 👜', value: inr(balance), color: '#e6edf3', icon: '💵' },
          { label: 'Holdings Value', value: inr(totalValue), color: '#f0883e', icon: '📈' },
          { label: 'Unrealized P&L', value: `${unrealizedPnl >= 0 ? '+' : ''}${inr(unrealizedPnl)}`, color: unrealizedPnl >= 0 ? '#3fb950' : '#f85149', icon: unrealizedPnl >= 0 ? '📗' : '📕' },
          { label: 'Realized P&L', value: `${realizedPnl >= 0 ? '+' : ''}${inr(realizedPnl)}`, color: realizedPnl >= 0 ? '#3fb950' : '#f85149', icon: '🏦' },
        ].map(c => (
          <div key={c.label} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#8b949e' }}>{c.label}</span>
              <span style={{ fontSize: 20 }}>{c.icon}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Holdings by Value (₹)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="symbol" tick={{ fill: '#6e7681', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6e7681', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8 }} formatter={v => [inr(v), 'Value']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#ff6b35' : '#3fb950'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Holdings Table */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3' }}>Holdings ({holdings.length})</div>
          <button onClick={() => navigate('/trading')} style={{ padding: '6px 14px', background: '#ff6b35', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ New Position</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr 1fr 1fr 0.8fr', padding: '10px 20px', borderBottom: '1px solid #30363d', fontSize: 11, color: '#6e7681', fontWeight: 600, textTransform: 'uppercase' }}>
          <span>Symbol</span><span>Shares</span><span>Avg Price</span><span>Curr Price</span><span>Value</span><span>P&L</span><span>Return</span>
        </div>
        {holdings.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8b949e' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div>No holdings yet. <span onClick={() => navigate('/trading')} style={{ color: '#ff6b35', cursor: 'pointer' }}>Start trading</span></div>
          </div>
        ) : holdings.map(h => {
          const curr = h.currentPrice || h.avgBuyPrice;
          const val = h.quantity * curr;
          const cost = h.quantity * h.avgBuyPrice;
          const pnl = val - cost;
          const pct = cost > 0 ? ((pnl / cost) * 100).toFixed(2) : '0.00';
          const isIndian = h.symbol.endsWith('.NS') || h.symbol.endsWith('.BSE');
          return (
            <div key={h.symbol} onClick={() => navigate(`/trading/${h.symbol}`)} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr 1fr 1fr 0.8fr', padding: '14px 20px', borderBottom: '1px solid #21262d', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#1c2128'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 700, color: '#e6edf3' }}>{h.symbol.replace('.NS', '')}</div>
                  <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: isIndian ? 'rgba(255,107,53,0.12)' : 'rgba(88,166,255,0.12)', color: isIndian ? '#ff6b35' : '#58a6ff' }}>{isIndian ? 'NSE' : 'US'}</span>
                </div>
                <div style={{ fontSize: 11, color: '#8b949e' }}>{h.companyName}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#e6edf3', fontWeight: 500 }}>{h.quantity}</div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#8b949e' }}>{inr(h.avgBuyPrice)}</div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#e6edf3' }}>{inr(curr)}</div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#e6edf3', fontWeight: 600 }}>{inr(val)}</div>
              <div style={{ display: 'flex', alignItems: 'center', color: pnl >= 0 ? '#3fb950' : '#f85149', fontWeight: 600 }}>{pnl >= 0 ? '+' : ''}{inr(pnl)}</div>
              <div style={{ display: 'flex', alignItems: 'center', color: pnl >= 0 ? '#3fb950' : '#f85149', fontWeight: 600 }}>{pct >= 0 ? '+' : ''}{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
