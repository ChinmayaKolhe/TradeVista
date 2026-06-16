import React, { useEffect, useState } from 'react';
import { journalAPI } from '../services/api';

const emotions = ['confident', 'fearful', 'greedy', 'neutral', 'anxious', 'excited'];
const emotionEmoji = { confident: '😎', fearful: '😨', greedy: '🤑', neutral: '😐', anxious: '😰', excited: '🤩' };
const outcomeColors = { win: '#3fb950', loss: '#f85149', breakeven: '#f0883e', open: '#58a6ff' };

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ symbol: '', tradeType: 'BUY', quantity: 1, entryPrice: '', exitPrice: '', emotion: 'neutral', strategy: '', notes: '', outcome: 'open', pnl: 0 });

  const load = async () => {
    try {
      const [eRes, aRes] = await Promise.all([journalAPI.getAll(), journalAPI.getAnalytics()]);
      setEntries(eRes.data.entries || []);
      setAnalytics(aRes.data.analytics);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await journalAPI.create({ ...form, symbol: form.symbol.toUpperCase(), quantity: parseInt(form.quantity), entryPrice: parseFloat(form.entryPrice), exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : null });
      setShowForm(false);
      setForm({ symbol: '', tradeType: 'BUY', quantity: 1, entryPrice: '', exitPrice: '', emotion: 'neutral', strategy: '', notes: '', outcome: 'open', pnl: 0 });
      load();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this journal entry?')) return;
    await journalAPI.delete(id);
    setEntries(entries.filter(e => e._id !== id));
  };

  const inputStyle = { width: '100%', padding: '9px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 4 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>AI Trading Journal</h1>
          <p style={{ color: '#8b949e', fontSize: 14 }}>Log trades and receive AI-generated insights</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', background: showForm ? '#30363d' : 'linear-gradient(135deg, #58a6ff, #3fb950)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Log Trade'}
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Trades', value: analytics.totalTrades, color: '#58a6ff', icon: '📊' },
            { label: 'Win Rate', value: `${analytics.winRate}%`, color: '#3fb950', icon: '🎯' },
            { label: 'Wins', value: analytics.wins, color: '#3fb950', icon: '✅' },
            { label: 'Losses', value: analytics.losses, color: '#f85149', icon: '❌' },
            { label: 'Total P&L', value: `${analytics.totalPnl >= 0 ? '+' : ''}$${analytics.totalPnl}`, color: analytics.totalPnl >= 0 ? '#3fb950' : '#f85149', icon: '💰' },
          ].map(c => (
            <div key={c.label} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#8b949e' }}>{c.label}</span>
                <span>{c.icon}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI Insights */}
      {analytics?.insights?.length > 0 && (
        <div style={{ background: 'rgba(88,166,255,0.05)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#58a6ff', marginBottom: 12 }}>🧠 AI Journal Insights</div>
          {analytics.insights.map((ins, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < analytics.insights.length - 1 ? 10 : 0 }}>
              <span style={{ color: '#58a6ff', fontSize: 16 }}>→</span>
              <span style={{ fontSize: 14, color: '#c9d1d9', lineHeight: 1.6 }}>{ins}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add Entry Form */}
      {showForm && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3', marginBottom: 20 }}>Log New Trade</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Symbol *</label>
                <input value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} placeholder="AAPL" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Trade Type</label>
                <select value={form.tradeType} onChange={e => setForm({ ...form, tradeType: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Quantity *</label>
                <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Entry Price *</label>
                <input type="number" step="0.01" value={form.entryPrice} onChange={e => setForm({ ...form, entryPrice: e.target.value })} placeholder="0.00" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Exit Price</label>
                <input type="number" step="0.01" value={form.exitPrice} onChange={e => setForm({ ...form, exitPrice: e.target.value })} placeholder="Optional" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Outcome</label>
                <select value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {['open', 'win', 'loss', 'breakeven'].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Emotion During Trade</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {emotions.map(em => (
                  <button key={em} type="button" onClick={() => setForm({ ...form, emotion: em })} style={{ padding: '6px 12px', background: form.emotion === em ? 'rgba(88,166,255,0.2)' : '#0d1117', border: `1px solid ${form.emotion === em ? '#58a6ff' : '#30363d'}`, borderRadius: 20, color: form.emotion === em ? '#58a6ff' : '#8b949e', cursor: 'pointer', fontSize: 12, fontWeight: form.emotion === em ? 600 : 400 }}>
                    {emotionEmoji[em]} {em}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Strategy</label>
                <input value={form.strategy} onChange={e => setForm({ ...form, strategy: e.target.value })} placeholder="e.g. Breakout, Momentum..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>P&L ($)</label>
                <input type="number" step="0.01" value={form.pnl} onChange={e => setForm({ ...form, pnl: e.target.value })} placeholder="0.00" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="What was your thesis? What did you learn?" rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
            </div>

            <button type="submit" disabled={submitting} style={{ padding: '10px 24px', background: submitting ? '#30363d' : 'linear-gradient(135deg, #58a6ff, #3fb950)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Saving...' : 'Save Journal Entry'}
            </button>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #30363d', fontSize: 15, fontWeight: 600, color: '#e6edf3' }}>
          Trade Entries ({entries.length})
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8b949e' }}>Loading journal...</div>
        ) : entries.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8b949e' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📓</div>
            <div>No journal entries yet. Log your first trade above!</div>
          </div>
        ) : entries.map(entry => (
          <div key={entry._id} style={{ padding: '18px 20px', borderBottom: '1px solid #21262d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#e6edf3' }}>{entry.symbol}</span>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: entry.tradeType === 'BUY' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)', color: entry.tradeType === 'BUY' ? '#3fb950' : '#f85149' }}>{entry.tradeType}</span>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: outcomeColors[entry.outcome] || '#8b949e', border: `1px solid ${outcomeColors[entry.outcome] || '#30363d'}` }}>{entry.outcome?.toUpperCase()}</span>
                <span style={{ fontSize: 13, color: '#8b949e' }}>{emotionEmoji[entry.emotion]} {entry.emotion}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#6e7681' }}>{new Date(entry.createdAt).toLocaleDateString()}</span>
                <button onClick={() => handleDelete(entry._id)} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: 14, padding: '2px 6px', borderRadius: 4 }}>🗑</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: entry.notes || entry.aiInsight ? 10 : 0, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#8b949e' }}>Qty: <strong style={{ color: '#e6edf3' }}>{entry.quantity}</strong></span>
              <span style={{ fontSize: 13, color: '#8b949e' }}>Entry: <strong style={{ color: '#e6edf3' }}>${entry.entryPrice}</strong></span>
              {entry.exitPrice && <span style={{ fontSize: 13, color: '#8b949e' }}>Exit: <strong style={{ color: '#e6edf3' }}>${entry.exitPrice}</strong></span>}
              {entry.pnl !== 0 && <span style={{ fontSize: 13, color: '#8b949e' }}>P&L: <strong style={{ color: entry.pnl >= 0 ? '#3fb950' : '#f85149' }}>{entry.pnl >= 0 ? '+' : ''}₹{Number(entry.pnl).toLocaleString('en-IN', {minimumFractionDigits:2})}</strong></span>}
              {entry.strategy && <span style={{ fontSize: 13, color: '#8b949e' }}>Strategy: <strong style={{ color: '#e6edf3' }}>{entry.strategy}</strong></span>}
            </div>

            {entry.notes && (
              <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 8, lineHeight: 1.6 }}>📝 {entry.notes}</div>
            )}
            {entry.aiInsight && (
              <div style={{ background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.15)', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: '#58a6ff' }}>
                🤖 {entry.aiInsight}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
