import React, { useEffect, useState } from 'react';
import { sentimentAPI } from '../services/api';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const SentimentBadge = ({ sentiment }) => {
  const map = { POSITIVE: { color: '#3fb950', bg: 'rgba(63,185,80,0.1)', label: '📈 Positive' }, NEGATIVE: { color: '#f85149', bg: 'rgba(248,81,73,0.1)', label: '📉 Negative' }, NEUTRAL: { color: '#f0883e', bg: 'rgba(240,136,62,0.1)', label: '➡️ Neutral' } };
  const cfg = map[sentiment] || map.NEUTRAL;
  return <span style={{ padding: '4px 10px', background: cfg.bg, color: cfg.color, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{cfg.label}</span>;
};

export default function SentimentPage() {
  const [market, setMarket] = useState(null);
  const [stock, setStock] = useState(null);
  const [symbol, setSymbol] = useState('AAPL');
  const [inputSymbol, setInputSymbol] = useState('AAPL');
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    sentimentAPI.getMarket().then(({ data }) => setMarket(data.market)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const loadStock = async (e) => {
    e?.preventDefault();
    setStockLoading(true);
    try {
      const { data } = await sentimentAPI.getStock(symbol);
      setStock(data.sentiment);
    } catch (e) { console.error(e); }
    finally { setStockLoading(false); }
  };

  useEffect(() => { loadStock(); }, [symbol]);

  const moodMap = { BULLISH: { color: '#3fb950', icon: '🐂', label: 'Bullish' }, BEARISH: { color: '#f85149', icon: '🐻', label: 'Bearish' }, NEUTRAL: { color: '#f0883e', icon: '😐', label: 'Neutral' } };
  const mood = moodMap[market?.overallMood] || moodMap.NEUTRAL;

  const pieData = stock ? [
    { name: 'Positive', value: stock.positivePercent },
    { name: 'Negative', value: stock.negativePercent },
  ] : [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>AI Sentiment Intelligence</h1>
        <p style={{ color: '#8b949e', fontSize: 14 }}>Real-time news analysis and market sentiment scoring</p>
      </div>

      {/* Market Overview */}
      {loading ? (
        <div style={{ color: '#8b949e', padding: 20 }}>Loading market sentiment...</div>
      ) : market && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 8 }}>OVERALL MARKET MOOD</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 40 }}>{mood.icon}</span>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: mood.color }}>{mood.label}</div>
                  <div style={{ fontSize: 14, color: '#8b949e' }}>Based on {market.stockSentiments?.length} stocks analysed</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#3fb950' }}>{market.avgPositivePercent}%</div>
                <div style={{ fontSize: 12, color: '#8b949e' }}>Positive Signals</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f85149' }}>{100 - market.avgPositivePercent}%</div>
                <div style={{ fontSize: 12, color: '#8b949e' }}>Negative Signals</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 6 }}>
              <span>Fear</span><span>Greed</span>
            </div>
            <div style={{ height: 8, background: '#30363d', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${market.avgPositivePercent}%`, background: `linear-gradient(90deg, #f85149, #f0883e, #3fb950)`, borderRadius: 4, transition: 'width 1s ease' }} />
            </div>
          </div>
        </div>
      )}

      {/* Stock Sentiment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Stock Sentiment Analyser</div>
            <form onSubmit={(e) => { e.preventDefault(); setSymbol(inputSymbol.toUpperCase()); }} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input value={inputSymbol} onChange={e => setInputSymbol(e.target.value.toUpperCase())} placeholder="Symbol (AAPL, TSLA...)" style={{ flex: 1, padding: '8px 14px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none' }} />
              <button type="submit" style={{ padding: '8px 16px', background: '#58a6ff', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Analyse</button>
            </form>

            {stockLoading ? (
              <div style={{ color: '#8b949e', textAlign: 'center', padding: 20 }}>Analysing sentiment...</div>
            ) : stock && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{stock.symbol}</div>
                    <SentimentBadge sentiment={stock.overallSentiment} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#58a6ff' }}>{stock.confidence}%</div>
                    <div style={{ fontSize: 11, color: '#8b949e' }}>Confidence</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1, background: 'rgba(63,185,80,0.1)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#3fb950' }}>{stock.positivePercent}%</div>
                    <div style={{ fontSize: 11, color: '#8b949e' }}>Positive News</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(248,81,73,0.1)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#f85149' }}>{stock.negativePercent}%</div>
                    <div style={{ fontSize: 11, color: '#8b949e' }}>Negative News</div>
                  </div>
                </div>

                <div style={{ background: '#0d1117', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4 }}>TOP SENTIMENT DRIVER</div>
                  <div style={{ fontSize: 13, color: '#e6edf3' }}>{stock.topDriver}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* News Feed */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>News Analysis</div>
          {stock?.news?.map((n, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #21262d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontSize: 13, color: '#e6edf3', lineHeight: 1.5, flex: 1 }}>{n.title}</div>
                <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, flexShrink: 0, background: n.sentiment === 'positive' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)', color: n.sentiment === 'positive' ? '#3fb950' : '#f85149' }}>
                  {n.sentiment}
                </span>
              </div>
              <div style={{ marginTop: 6 }}>
                <div style={{ height: 4, background: '#30363d', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${n.score * 100}%`, background: n.sentiment === 'positive' ? '#3fb950' : '#f85149', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, color: '#6e7681', marginTop: 3 }}>Score: {(n.score * 100).toFixed(0)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Sentiment Grid */}
      {market?.stockSentiments && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20, marginTop: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Market-Wide Sentiment</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {market.stockSentiments.map(s => (
              <div key={s.symbol} style={{ background: '#0d1117', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: '#e6edf3', fontSize: 15 }}>{s.symbol}</div>
                  <SentimentBadge sentiment={s.overallSentiment} />
                </div>
                <div style={{ height: 4, background: '#30363d', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.positivePercent}%`, background: s.overallSentiment === 'POSITIVE' ? '#3fb950' : '#f85149', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>{s.positivePercent}% positive</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
