import { useState, useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { bodyWeightHistory } from '../../shared/lib/mockData';

const RANGES = ['4W', '8W', '16W', 'All'] as const;
type Range = typeof RANGES[number];

const GOAL_WEIGHT = 80;

function computeMA(data: number[], window: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    const slice = data.slice(i - window + 1, i + 1);
    return Math.round((slice.reduce((a, b) => a + b, 0) / window) * 10) / 10;
  });
}

const MEASUREMENTS = [
  { label: 'Chest', current: 103, prev: 101, muscle: true },
  { label: 'Waist', current: 82, prev: 84, muscle: false },
  { label: 'Arms', current: 37.5, prev: 36.8, muscle: true },
  { label: 'Thighs', current: 58, prev: 56.5, muscle: true },
  { label: 'Hips', current: 97, prev: 97.5, muscle: false },
];

const PHOTOS = [
  { date: 'Jan 1', label: 'Start' },
  { date: 'Feb 1', label: 'Week 4' },
  { date: 'Mar 1', label: 'Week 8' },
  { date: 'Apr 1', label: 'Week 12' },
  { date: 'Apr 6', label: 'Current' },
  { label: 'Add Photo', add: true },
];

function BFDonut({ bf = 14.2 }: { bf?: number }) {
  const r = 68; const cx = 90; const cy = 90;
  const circumference = 2 * Math.PI * r;
  const filled = (bf / 30) * circumference;
  const cat = bf < 10 ? 'Essential' : bf < 18 ? 'Athlete' : bf < 25 ? 'Fitness' : bf < 32 ? 'Average' : 'Obese';
  const catColor = bf < 10 ? 'var(--violet2)' : bf < 18 ? 'var(--mint)' : bf < 25 ? 'var(--gold)' : 'var(--orange)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg4)" strokeWidth={16} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg5)" strokeWidth={16}
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={circumference * 0.125} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#bfGrad)" strokeWidth={16} strokeLinecap="round"
          strokeDasharray={`${filled * 0.75} ${circumference}`}
          strokeDashoffset={circumference * 0.125} transform={`rotate(-90 ${cx} ${cy})`}
        />
        <defs>
          <linearGradient id="bfGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--violet)" />
            <stop offset="100%" stopColor="var(--mint)" />
          </linearGradient>
        </defs>
        <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--txt)" fontSize="22" fontWeight="800" fontFamily="Syne,sans-serif">{bf}%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={catColor} fontSize="12" fontWeight="600" fontFamily="DM Sans,sans-serif">{cat}</text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill="var(--txt3)" fontSize="11" fontFamily="DM Sans,sans-serif">Body Fat</text>
      </svg>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[['Essential', '<10%'], ['Athlete', '10–18%'], ['Fitness', '18–25%']].map(([label, range]) => (
          <div key={label} style={{ fontSize: 11, color: 'var(--txt3)', background: 'var(--bg4)', padding: '3px 8px', borderRadius: 6 }}>{label} <span style={{ color: 'var(--txt2)' }}>{range}</span></div>
        ))}
      </div>
    </div>
  );
}

export default function BodyMetricsTab() {
  const [range, setRange] = useState<Range>('All');

  const sliceMap: Record<Range, number> = { '4W': 4, '8W': 8, '16W': 16, All: 999 };
  const sliced = bodyWeightHistory.weights.slice(-sliceMap[range]);
  const labels = bodyWeightHistory.labels.slice(-sliceMap[range]);
  const ma3 = computeMA(sliced, 3);

  const chartData = useMemo(() => sliced.map((w, i) => ({
    date: labels[i], weight: w, ma: ma3[i], goal: GOAL_WEIGHT,
  })), [sliced, labels, ma3]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: 'var(--txt3)', marginBottom: 6 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color || 'var(--txt)', marginBottom: 3 }}>
            {p.name === 'weight' ? '⚖️ Weight' : p.name === 'ma' ? '📉 3W Avg' : '🎯 Goal'}: <strong>{p.value} kg</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Weight Chart Card */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--txt)', marginBottom: 2 }}>Body Weight</div>
            <div style={{ fontSize: 12, color: 'var(--txt3)' }}>With 3-week moving average and goal line</div>
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', padding: 4, borderRadius: 10 }}>
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', background: range === r ? 'var(--violet)' : 'transparent', color: range === r ? '#fff' : 'var(--txt3)', transition: 'all 0.2s' }}>{r}</button>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
          {[{ color: 'var(--violet2)', label: 'Weight' }, { color: 'var(--mint)', label: '3W Moving Avg' }, { color: 'var(--orange)', label: 'Goal (80 kg)', dashed: true }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 2, background: l.dashed ? 'none' : l.color, borderTop: l.dashed ? `2px dashed ${l.color}` : 'none' }} />
              <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{l.label}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--violet)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--txt3)', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: 'var(--txt3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={GOAL_WEIGHT} stroke="var(--orange)" strokeDasharray="6 3" strokeWidth={1.5} />
            <Area type="monotone" dataKey="weight" stroke="var(--violet2)" fill="url(#weightGrad)" strokeWidth={2} dot={false} name="weight" />
            <Line type="monotone" dataKey="ma" stroke="var(--mint)" strokeWidth={2.5} dot={false} connectNulls name="ma" />
          </AreaChart>
        </ResponsiveContainer>

        {/* Current stats row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Current', val: '82.0 kg', delta: null },
            { label: 'Change (16W)', val: '−4.2 kg', delta: 'down', good: true },
            { label: 'Weekly Rate', val: '−0.26 kg', delta: 'down', good: true },
            { label: 'Goal', val: '80.0 kg', delta: null },
            { label: 'Remaining', val: '2.0 kg', delta: null },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'var(--bg3)', borderRadius: 10 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: s.delta ? (s.good ? 'var(--mint)' : 'var(--red)') : 'var(--txt)', marginBottom: 3 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Measurements + BF% */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Measurements */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--txt)', marginBottom: 18 }}>Body Measurements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MEASUREMENTS.map(m => {
              const delta = m.current - m.prev;
              const isGood = m.muscle ? delta > 0 : delta < 0;
              return (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: 'var(--bg3)' }}>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--txt2)' }}>{m.label}</span>
                  <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--txt)', marginRight: 12 }}>{m.current} cm</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isGood ? 'var(--mint)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 2, background: isGood ? 'rgba(0,229,160,0.1)' : 'rgba(255,59,92,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                    {delta > 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg4)', borderRadius: 10, fontSize: 11, color: 'var(--txt3)', lineHeight: 1.6 }}>
            ↑ Good for muscles &nbsp;|&nbsp; ↓ Good for waist/hips
          </div>
        </div>

        {/* BF% Donut */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--txt)', marginBottom: 18, alignSelf: 'flex-start' }}>Body Composition</div>
          <BFDonut bf={14.2} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', marginTop: 16 }}>
            {[{ label: 'Fat Mass', val: '11.6 kg', color: 'var(--orange)' }, { label: 'Lean Mass', val: '70.4 kg', color: 'var(--mint)' }, { label: 'Prev BF%', val: '15.8%', color: 'var(--txt2)' }, { label: 'Change', val: '−1.6%', color: 'var(--mint)' }].map(s => (
              <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Photos */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--txt)', marginBottom: 18 }}>Progress Photos</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {PHOTOS.map((p, i) => (
            <div key={i} style={{ aspectRatio: '3/4', borderRadius: 12, background: (p as any).add ? 'rgba(124,92,252,0.08)' : 'var(--bg3)', border: `1px dashed ${(p as any).add ? 'var(--violet)' : 'var(--border)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
              {(p as any).add ? (
                <>
                  <div style={{ fontSize: 22, color: 'var(--violet2)' }}>+</div>
                  <span style={{ fontSize: 11, color: 'var(--violet2)', fontWeight: 600 }}>Add Photo</span>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 28 }}>👤</div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{p.date}</div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
