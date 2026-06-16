import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { marketAPI } from '../services/api';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const calcSMA = (data, period) => data.map((_, i, arr) => {
  if (i < period - 1) return null;
  return arr.slice(i - period + 1, i + 1).reduce((s, d) => s + d.close, 0) / period;
});

const calcRSI = (data, period = 14) => {
  const rsi = Array(data.length).fill(null);
  if (data.length < period + 1) return rsi;
  for (let i = period; i < data.length; i++) {
    let gains = 0, losses = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = data[j].close - data[j - 1].close;
      if (diff > 0) gains += diff; else losses -= diff;
    }
    const rs = losses === 0 ? 100 : gains / losses;
    rsi[i] = +(100 - 100 / (1 + rs)).toFixed(1);
  }
  return rsi;
};

const intervals = ['1day', '1week', '1month'];

export default function ChartsPage() {
  const { symbol: ps } = useParams();
  const [symbol, setSymbol] = useState(ps || 'RELIANCE.NS');
  const [inputSymbol, setInputSymbol] = useState(ps || 'RELIANCE.NS');
  const [interval, setInterval] = useState('1day');
  const [rawCandles, setRawCandles] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [indicators, setIndicators] = useState({ sma20: true, sma50: true, rsi: false, volume: true });
  const [loading, setLoading] = useState(true);

  const loadCandles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await marketAPI.getCandles(symbol, interval, 90);
      const candles = data.candles || [];
      setRawCandles(candles);
      const parsed = candles.map(c => ({
        datetime: c.datetime?.slice(interval === '1day' ? 5 : 0, 10),
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
        volume: parseInt(c.volume),
      }));
      const sma20 = calcSMA(parsed, 20);
      const sma50 = calcSMA(parsed, 50);
      const rsiArr = calcRSI(parsed);
      setChartData(parsed.map((d, i) => ({ ...d, sma20: sma20[i], sma50: sma50[i], rsi: rsiArr[i] })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [symbol, interval]);

  useEffect(() => { loadCandles(); }, [loadCandles]);

  const handleSearch = (e) => { e.preventDefault(); setSymbol(inputSymbol.toUpperCase()); };

  const last = chartData[chartData.length - 1];
  const first = chartData[0];
  const priceChange = last && first ? last.close - first.close : 0;
  const pctChange = first?.close ? (priceChange / first.close * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Technical Analysis</h1>
        <p style={{ color: '#8b949e', fontSize: 14 }}>Professional charting with technical indicators</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input value={inputSymbol} onChange={e => setInputSymbol(e.target.value.toUpperCase())} placeholder="Symbol" style={{ padding: '8px 14px', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none', width: 120 }} />
          <button type="submit" style={{ padding: '8px 16px', background: '#58a6ff', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Load</button>
        </form>
        <div style={{ display: 'flex', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
          {intervals.map(iv => (
            <button key={iv} onClick={() => setInterval(iv)} style={{ padding: '8px 14px', background: interval === iv ? '#58a6ff' : 'transparent', border: 'none', color: interval === iv ? '#fff' : '#8b949e', cursor: 'pointer', fontSize: 13, fontWeight: interval === iv ? 600 : 400 }}>
              {iv === '1day' ? 'Daily' : iv === '1week' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(indicators).map(([key, active]) => (
            <button key={key} onClick={() => setIndicators(p => ({ ...p, [key]: !p[key] }))} style={{ padding: '6px 12px', background: active ? 'rgba(88,166,255,0.2)' : '#161b22', border: `1px solid ${active ? '#58a6ff' : '#30363d'}`, borderRadius: 6, color: active ? '#58a6ff' : '#6e7681', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Price Info */}
      {last && (
        <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['Close', `₹${last.close?.toLocaleString('en-IN',{minimumFractionDigits:2})}`], ['Open', `₹${last.open?.toLocaleString('en-IN',{minimumFractionDigits:2})}`], ['High', `₹${last.high?.toLocaleString('en-IN',{minimumFractionDigits:2})}`], ['Low', `₹${last.low?.toLocaleString('en-IN',{minimumFractionDigits:2})}`], ['Period Change', `${priceChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%`]].map(([l, v], i) => (
            <div key={l} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '10px 16px' }}>
              <div style={{ fontSize: 11, color: '#6e7681', marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: i === 4 ? (priceChange >= 0 ? '#3fb950' : '#f85149') : '#e6edf3' }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Chart */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>{symbol} — Price & Volume</div>
        {loading ? (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>Loading chart data...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid stroke="#21262d" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="datetime" tick={{ fill: '#6e7681', fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 8)} />
              <YAxis yAxisId="price" domain={['auto', 'auto']} tick={{ fill: '#6e7681', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              {indicators.volume && <YAxis yAxisId="vol" orientation="right" tick={{ fill: '#6e7681', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />}
              <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }} />
              <Line yAxisId="price" type="monotone" dataKey="close" stroke="#58a6ff" strokeWidth={2} dot={false} name="Price" />
              {indicators.sma20 && <Line yAxisId="price" type="monotone" dataKey="sma20" stroke="#f0883e" strokeWidth={1.5} dot={false} name="SMA 20" strokeDasharray="4 2" />}
              {indicators.sma50 && <Line yAxisId="price" type="monotone" dataKey="sma50" stroke="#bc8cff" strokeWidth={1.5} dot={false} name="SMA 50" strokeDasharray="4 2" />}
              {indicators.volume && <Bar yAxisId="vol" dataKey="volume" fill="#30363d" opacity={0.6} name="Volume" radius={[2, 2, 0, 0]} />}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* RSI */}
      {indicators.rsi && !loading && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 12 }}>RSI (14)</div>
          <ResponsiveContainer width="100%" height={120}>
            <ComposedChart data={chartData}>
              <CartesianGrid stroke="#21262d" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="datetime" tick={{ fill: '#6e7681', fontSize: 9 }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 6)} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6e7681', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }} />
              <ReferenceLine y={70} stroke="#f85149" strokeDasharray="4 2" strokeOpacity={0.6} />
              <ReferenceLine y={30} stroke="#3fb950" strokeDasharray="4 2" strokeOpacity={0.6} />
              <Line type="monotone" dataKey="rsi" stroke="#f0883e" strokeWidth={1.5} dot={false} name="RSI" />
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#f85149' }}>— Overbought (70)</span>
            <span style={{ fontSize: 11, color: '#3fb950' }}>— Oversold (30)</span>
          </div>
        </div>
      )}
    </div>
  );
}
