import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketAPI, portfolioAPI, tradingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Format number as Indian Rupee string
const inr = (val, decimals = 2) =>
  `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

const StatCard = ({ title, value, sub, color = '#ff6b35', icon }) => (
  <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: '20px 24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: '#6e7681', marginTop: 4 }}>{sub}</div>}
      </div>
      <span style={{ fontSize: 28 }}>{icon}</span>
    </div>
  </div>
);

const COLORS = ['#ff6b35', '#3fb950', '#f0883e', '#f85149', '#bc8cff', '#39d353'];

export default function DashboardPage() {
  const { user, balance } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [orders, setOrders] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [portRes, ordRes, ovRes] = await Promise.all([
          portfolioAPI.get(),
          tradingAPI.getOrders(),
          marketAPI.getOverview(),
        ]);
        setPortfolio(portRes.data.portfolio);
        setOrders(ordRes.data.orders?.slice(0, 5) || []);
        setOverview(ovRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const holdings = portfolio?.holdings || [];
  const totalValue = holdings.reduce((acc, h) => acc + h.quantity * (h.currentPrice || h.avgBuyPrice), 0);
  const totalCost = holdings.reduce((acc, h) => acc + h.quantity * h.avgBuyPrice, 0);
  const unrealizedPnl = totalValue - totalCost;
  const totalPortfolio = balance + totalValue;

  // Chart anchored at current portfolio value
  const pnlChartData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: totalPortfolio + Math.sin(i * 0.5) * (totalPortfolio * 0.06) + i * (totalPortfolio * 0.015),
  }));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div style={{ color: '#8b949e' }}>Loading dashboard...</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>
          Namaste, {user?.name?.split(' ')[0]} 
        </h1>
        <p style={{ color: '#8b949e', fontSize: 14 }}>Here's your trading overview for today — Indian Market</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Portfolio Value" value={inr(totalPortfolio)} icon="💰" color="#3fb950" sub={`Cash: ${inr(balance)}`} />
        <StatCard title="Virtual Balance" value={inr(balance)} icon="👜" color="#ff6b35" sub="Available to trade" />
        <StatCard title="Holdings Value" value={inr(totalValue)} icon="📈" color="#f0883e" sub={`${holdings.length} positions`} />
        <StatCard
          title="Unrealized P&L"
          value={`${unrealizedPnl >= 0 ? '+' : ''}${inr(unrealizedPnl)}`}
          icon={unrealizedPnl >= 0 ? '🟢' : '🔴'}
          color={unrealizedPnl >= 0 ? '#3fb950' : '#f85149'}
          sub={`${totalCost > 0 ? ((unrealizedPnl / totalCost) * 100).toFixed(2) : '0.00'}% return`}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Portfolio Growth */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#e6edf3' }}>Portfolio Growth (YTD)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={pnlChartData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#6e7681', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6e7681', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8 }} formatter={(v) => [inr(v), 'Portfolio']} />
              <Area type="monotone" dataKey="value" stroke="#ff6b35" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#e6edf3' }}>Asset Allocation</div>
          {holdings.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={holdings.slice(0, 6)} dataKey="quantity" nameKey="symbol" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                    {holdings.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {holdings.slice(0, 6).map((h, i) => (
                  <div key={h.symbol} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: '#8b949e' }}>{h.symbol}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: '#8b949e', fontSize: 14, flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 32 }}>📊</span>
              <span>No holdings yet</span>
              <button onClick={() => navigate('/trading')} style={{ padding: '6px 14px', background: '#ff6b35', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer' }}>Start Trading</button>
            </div>
          )}
        </div>
      </div>

      {/* Indian Market Indices & Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Indian Market Indices */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3' }}>Indian Indices</div>
            <span style={{ fontSize: 11, color: '#8b949e', padding: '2px 8px', background: '#21262d', borderRadius: 4 }}>NSE / BSE</span>
          </div>
          {(overview?.indices || []).map((idx) => (
            <div key={idx.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #21262d' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{idx.name}</div>
                <div style={{ fontSize: 12, color: '#8b949e' }}>{Number(idx.value).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: idx.changePercent >= 0 ? '#3fb950' : '#f85149' }}>
                  {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent?.toFixed(2)}%
                </div>
                <div style={{ fontSize: 12, color: '#6e7681' }}>{idx.change >= 0 ? '+' : ''}{idx.change?.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3' }}>Recent Orders</div>
            <button onClick={() => navigate('/trading')} style={{ fontSize: 12, color: '#ff6b35', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
          </div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#8b949e' }}>No orders yet. Start trading!</div>
          ) : orders.map((o) => (
            <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #21262d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: o.type === 'BUY' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: o.type === 'BUY' ? '#3fb950' : '#f85149' }}>{o.type === 'BUY' ? 'B' : 'S'}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{o.symbol}</div>
                  <div style={{ fontSize: 12, color: '#8b949e' }}>{o.quantity} shares @ {inr(o.price)}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{inr(o.totalAmount)}</div>
                <div style={{ fontSize: 11, color: '#6e7681' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
