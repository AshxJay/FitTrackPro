import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { strengthHistory } from '../../shared/lib/mockData';

const RANGES = {
  '1M': 9,
  '3M': strengthHistory.labels.length,
  '6M': strengthHistory.labels.length,
  '1Y': strengthHistory.labels.length,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--txt2)' }}>{p.name}:</span>
          <span style={{ color: 'var(--txt)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{p.value}kg</span>
        </div>
      ))}
    </div>
  );
};

export default function StrengthChart() {
  const [range, setRange] = useState<keyof typeof RANGES>('1M');

  const count = RANGES[range];
  const sliced = strengthHistory.labels.slice(-count).map((label, i) => {
    const offset = strengthHistory.labels.length - count;
    return {
      label,
      Bench: strengthHistory.bench[offset + i],
      Squat: strengthHistory.squat[offset + i],
      Deadlift: strengthHistory.deadlift[offset + i],
    };
  });

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}>Strength Progress</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 3 }}>Estimated 1RM across primary lifts</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(Object.keys(RANGES) as (keyof typeof RANGES)[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none',
                background: range === r ? 'var(--violet)' : 'transparent',
                color: range === r ? '#fff' : 'var(--txt3)',
                transition: 'all 0.15s',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {[{ label: 'Bench', color: '#7c5cfc' }, { label: 'Squat', color: '#00e5a0' }, { label: 'Deadlift', color: '#ff6b35' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
            <span style={{ fontSize: 11, color: 'var(--txt2)' }}>{l.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--txt3)' }}>All values in kg</div>
      </div>

      {/* Chart */}
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sliced} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#555575', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#555575', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}kg`} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Bench" stroke="#7c5cfc" strokeWidth={2} dot={{ fill: '#7c5cfc', r: 3, strokeWidth: 2, stroke: '#09090f' }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="Squat" stroke="#00e5a0" strokeWidth={2} dot={{ fill: '#00e5a0', r: 3, strokeWidth: 2, stroke: '#09090f' }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="Deadlift" stroke="#ff6b35" strokeWidth={2} dot={{ fill: '#ff6b35', r: 3, strokeWidth: 2, stroke: '#09090f' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
