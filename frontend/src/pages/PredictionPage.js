import React, { useEffect, useState } from 'react';
import { predictionAPI, marketAPI } from '../services/api';

const DirectionBadge = ({ direction }) => {
  const map = { BULLISH: { color: '#3fb950', bg: 'rgba(63,185,80,0.1)', icon: '🚀' }, BEARISH: { color: '#f85149', bg: 'rgba(248,81,73,0.1)', icon: '📉' }, NEUTRAL: { color: '#f0883e', bg: 'rgba(240,136,62,0.1)', icon: '➡️' } };
  const c = map[direction] || map.NEUTRAL;
  return <span style={{ padding: '4px 12px', background: c.bg, color: c.color, borderRadius: 20, fontSize: 13, fontWeight: 700 }}>{c.icon} {direction}</span>;
};

const RiskBadge = ({ risk }) => {
  const c = { LOW: '#3fb950', MEDIUM: '#f0883e', HIGH: '#f85149' }[risk] || '#8b949e';
  return <span style={{ padding: '2px 8px', border: `1px solid ${c}`, color: c, borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{risk} RISK</span>;
};

export default function PredictionPage() {
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [inputSymbol, setInputSymbol] = useState('RELIANCE.NS');
  const [prediction, setPrediction] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);

  const loadPrediction = async (sym) => {
    setLoading(true);
    try {
      const [qRes] = await Promise.all([marketAPI.getQuote(sym)]);
      setQuote(qRes.data.quote);
      const { data } = await predictionAPI.get(sym, qRes.data.quote?.price || 150);
      setPrediction(data.prediction);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadPrediction(symbol);
    predictionAPI.getRecent().then(({ data }) => setRecent(data.predictions || [])).catch(console.error);
  }, [symbol]);

  const handleSearch = (e) => { e.preventDefault(); setSymbol(inputSymbol.toUpperCase()); };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>AI Market Prediction Engine</h1>
        <p style={{ color: '#8b949e', fontSize: 14 }}>Transformer-based forecasting with technical indicator analysis</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Prediction Panel */}
        <div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input value={inputSymbol} onChange={e => setInputSymbol(e.target.value.toUpperCase())} placeholder="NSE: RELIANCE.NS, TCS.NS · US: AAPL" style={{ flex: 1, padding: '10px 14px', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none' }} />
            <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #ff6b35, #f7931e)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Predict</button>
          </form>

          {loading ? (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
              <div style={{ color: '#8b949e' }}>AI is analysing {symbol}...</div>
              <div style={{ fontSize: 12, color: '#6e7681', marginTop: 8 }}>Using technical indicators and market sentiment</div>
            </div>
          ) : prediction && (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 24 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>{prediction.symbol}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <DirectionBadge direction={prediction.direction} />
                    <RiskBadge risk={prediction.riskLevel} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4 }}>CONFIDENCE</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: prediction.confidence > 75 ? '#3fb950' : prediction.confidence > 55 ? '#f0883e' : '#f85149' }}>{prediction.confidence}%</div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ height: 8, background: '#30363d', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${prediction.confidence}%`, background: `linear-gradient(90deg, #f85149, #f0883e, #3fb950)`, borderRadius: 4, transition: 'width 1s ease' }} />
                </div>
              </div>

              {/* Price Targets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#0d1117', borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4 }}>Current Price</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3' }}>₹{Number(prediction.currentPrice).toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
                </div>
                <div style={{ background: '#0d1117', borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4 }}>Target Price ({prediction.timeframe})</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: prediction.targetPrice > prediction.currentPrice ? '#3fb950' : '#f85149' }}>
                    ₹{Number(prediction.targetPrice).toLocaleString('en-IN', {minimumFractionDigits:2})}
                  </div>
                  <div style={{ fontSize: 12, color: prediction.targetPrice > prediction.currentPrice ? '#3fb950' : '#f85149' }}>
                    {prediction.targetPrice > prediction.currentPrice ? '+' : ''}{(((prediction.targetPrice - prediction.currentPrice) / prediction.currentPrice) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div style={{ background: 'rgba(88,166,255,0.05)', border: '1px solid rgba(88,166,255,0.15)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#58a6ff', fontWeight: 600, marginBottom: 6 }}>🧠 AI REASONING</div>
                <div style={{ fontSize: 14, color: '#c9d1d9', lineHeight: 1.6 }}>{prediction.reasoning}</div>
              </div>

              {/* Indicators */}
              {prediction.indicators && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#8b949e', marginBottom: 10 }}>TECHNICAL INDICATORS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {Object.entries(prediction.indicators).map(([key, val]) => (
                      <div key={key} style={{ background: '#0d1117', borderRadius: 6, padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#8b949e', textTransform: 'uppercase' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Predictions */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Recent Predictions</div>
          {recent.length === 0 ? (
            <div style={{ color: '#8b949e', textAlign: 'center', padding: 40 }}>No predictions yet. Generate your first one!</div>
          ) : recent.map(p => (
            <div key={p._id} onClick={() => { setSymbol(p.symbol); setInputSymbol(p.symbol); }} style={{ padding: '14px 0', borderBottom: '1px solid #21262d', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#e6edf3', fontSize: 15 }}>{p.symbol}</span>
                  <DirectionBadge direction={p.direction} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: p.confidence > 75 ? '#3fb950' : p.confidence > 55 ? '#f0883e' : '#f85149' }}>{p.confidence}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e' }}>
                <span>Target: ₹{Number(p.targetPrice).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
