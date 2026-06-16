import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { path: '/market', label: 'Market Scanner', icon: '📡' },
  { path: '/trading', label: 'Trading', icon: '⚡' },
  { path: '/portfolio', label: 'Portfolio', icon: '💼' },
  { path: '/charts', label: 'Charts', icon: '📊' },
  { path: '/sentiment', label: 'AI Sentiment', icon: '🧠' },
  { path: '/prediction', label: 'Predictions', icon: '🔮' },
  { path: '/journal', label: 'Journal', icon: '📓' },
  { path: '/watchlist', label: 'Watchlist', icon: '👁' },
];

export default function Layout() {
  const { user, balance, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        background: '#161b22',
        borderRight: '1px solid #30363d',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #ff6b35, #f7931e)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>TV</div>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 18, background: 'linear-gradient(90deg, #ff6b35, #f7931e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TradeVista</span>}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? '#58a6ff' : '#8b949e',
                background: isActive ? 'rgba(88,166,255,0.1)' : 'transparent',
                marginBottom: 2,
                transition: 'all 0.15s',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Balance */}
        {sidebarOpen && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #30363d', borderBottom: '1px solid #30363d' }}>
            <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>VIRTUAL PURSE 👜</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#ff6b35' }}>
              ₹{Number(balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}

        {/* User / Logout */}
        <div style={{ padding: '12px 8px' }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 12px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b35, #f7931e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: '#8b949e' }}>{user?.email}</div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: '1px solid #30363d', borderRadius: 8, color: '#f85149', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
          >
            <span>🚪</span>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{ height: 56, background: '#161b22', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0 }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 20, padding: 4, borderRadius: 6 }}
          >
            ☰
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => navigate('/trading')}
            style={{ padding: '6px 16px', background: 'linear-gradient(135deg, #ff6b35, #f7931e)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            + New Trade
          </button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
