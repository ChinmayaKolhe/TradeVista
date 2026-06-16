import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #ff6b35, #f7931e)', borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, marginBottom: 16 }}>TV</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(90deg, #ff6b35, #f7931e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>TradeVista</h1>
          <p style={{ color: '#8b949e', fontSize: 14 }}>India’s AI-Powered Virtual Trading Platform 🇮🇳</p>
        </div>

        {/* Card */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: '#e6edf3' }}>Sign In</h2>

          {error && (
            <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f85149', fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#8b949e', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                style={{ width: '100%', padding: '10px 14px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#8b949e', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '10px 14px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '11px', background: loading ? '#21262d' : 'linear-gradient(135deg, #ff6b35, #f7931e)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: '#8b949e' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#f7931e', textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#6e7681' }}>Register and choose your own virtual purse amount in ₹ — from ₹50K to ₹1 Crore</p>
        </div>
      </div>
    </div>
  );
}
