import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PRESET_AMOUNTS = [
  { label: '₹50,000', value: 50000 },
  { label: '₹1 Lakh', value: 100000 },
  { label: '₹5 Lakh', value: 500000 },
  { label: '₹10 Lakh', value: 1000000 },
  { label: '₹25 Lakh', value: 2500000 },
  { label: '₹1 Crore', value: 10000000 },
];

const formatINR = (val) => {
  if (!val) return '';
  const num = Number(val);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
  return `₹${num}`;
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = account, 2 = purse setup
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [virtualBalance, setVirtualBalance] = useState(1000000);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#0d1117', border: '1px solid #30363d',
    borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#8b949e', marginBottom: 6 };

  const handleStep1 = (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setError('');
    const finalBalance = useCustom ? Number(customAmount.replace(/[^0-9]/g, '')) : virtualBalance;
    if (!finalBalance || finalBalance < 1000) return setError('Minimum virtual balance is ₹1,000');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, finalBalance);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: step === 2 ? 500 : 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #ff6b35, #f7931e)', borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, marginBottom: 16 }}>TV</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(90deg, #ff6b35, #f7931e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>TradeVista</h1>
          <p style={{ color: '#8b949e', fontSize: 14 }}>India's virtual trading simulator</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: step >= s ? 'linear-gradient(135deg, #ff6b35, #f7931e)' : '#21262d',
                color: step >= s ? '#fff' : '#6e7681',
              }}>{s}</div>
              {s < 2 && <div style={{ width: 40, height: 2, background: step > s ? '#f7931e' : '#30363d', borderRadius: 2 }} />}
            </div>
          ))}
        </div>

        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 32 }}>
          {/* --- STEP 1: Account Info --- */}
          {step === 1 && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, color: '#e6edf3' }}>Create Account</h2>
              <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 24 }}>Step 1 of 2 — Personal details</p>

              {error && (
                <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f85149', fontSize: 14 }}>{error}</div>
              )}

              <form onSubmit={handleStep1}>
                {[
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Rahul Sharma' },
                  { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                  { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
                  { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} required style={inputStyle} />
                  </div>
                ))}

                <button type="submit" style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #ff6b35, #f7931e)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 }}>
                  Continue →
                </button>
              </form>

              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: '#8b949e' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#f7931e', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
              </div>
            </>
          )}

          {/* --- STEP 2: Virtual Purse Setup --- */}
          {step === 2 && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, color: '#e6edf3' }}>Setup Virtual Purse 👜</h2>
              <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 24 }}>Step 2 of 2 — Choose your starting virtual capital in Indian Rupees</p>

              {error && (
                <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f85149', fontSize: 14 }}>{error}</div>
              )}

              {/* Selected Amount Display */}
              <div style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.12), rgba(247,147,30,0.08))', border: '1px solid rgba(255,107,53,0.25)', borderRadius: 12, padding: '20px 24px', marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 6 }}>YOUR VIRTUAL PURSE</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#f7931e', letterSpacing: '-1px' }}>
                  {useCustom
                    ? (customAmount ? `₹${Number(customAmount.replace(/[^0-9]/g, '')).toLocaleString('en-IN')}` : '₹ —')
                    : `₹${virtualBalance.toLocaleString('en-IN')}`}
                </div>
                <div style={{ fontSize: 12, color: '#6e7681', marginTop: 4 }}>
                  Virtual money — no real funds involved 🛡️
                </div>
              </div>

              {/* Preset Buttons (Groww/Zerodha style) */}
              {!useCustom && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ ...labelStyle, marginBottom: 10 }}>Select Amount</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {PRESET_AMOUNTS.map(({ label, value }) => (
                      <button
                        key={value}
                        onClick={() => setVirtualBalance(value)}
                        style={{
                          padding: '10px 4px', border: `1.5px solid ${virtualBalance === value ? '#f7931e' : '#30363d'}`,
                          borderRadius: 8, background: virtualBalance === value ? 'rgba(247,147,30,0.12)' : '#0d1117',
                          color: virtualBalance === value ? '#f7931e' : '#8b949e', fontWeight: virtualBalance === value ? 700 : 400,
                          fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Amount Input */}
              <div style={{ marginBottom: 20 }}>
                <button
                  onClick={() => { setUseCustom(!useCustom); setCustomAmount(''); }}
                  style={{ fontSize: 13, color: '#f7931e', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: useCustom ? 10 : 0, textDecoration: 'underline' }}
                >
                  {useCustom ? '← Choose a preset amount' : 'Or enter custom amount'}
                </button>
                {useCustom && (
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#f7931e', fontWeight: 700, fontSize: 16 }}>₹</span>
                    <input
                      type="number"
                      min="1000"
                      max="100000000"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      placeholder="Enter amount (min ₹1,000)"
                      style={{ ...inputStyle, paddingLeft: 32 }}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Info Banner */}
              <div style={{ background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#6e7681' }}>
                💡 This amount is virtual capital only — you'll use it to practice trading Indian & global stocks, just like Groww or Zerodha paper trading.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '11px', background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#8b949e', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  style={{ flex: 2, padding: '11px', background: loading ? '#21262d' : 'linear-gradient(135deg, #ff6b35, #f7931e)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Setting up...' : '🎉 Start Trading'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
