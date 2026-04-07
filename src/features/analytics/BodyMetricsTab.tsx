import { useState, useMemo } from 'react';
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useAppStore } from '../../shared/stores/appStore';

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



export default function BodyMetricsTab() {
  const { bodyMetrics } = useAppStore();
  const [range, setRange] = useState<Range>('All');

  // Build chart data from real Firestore bodyMetrics, falling back to mock
  const hasRealData = bodyMetrics.length > 0;

  const sliceMap: Record<Range, number> = { '4W': 4, '8W': 8, '16W': 16, All: 999 };

  const chartData = useMemo(() => {
    if (hasRealData) {
      // Real data: sorted oldest→newest, sliced by range
      const sorted = [...bodyMetrics].reverse(); // Firestore returns newest first
      const sliced = sorted.slice(-sliceMap[range]);
      const weights = sliced.map(m => m.weight);
      const ma3 = computeMA(weights, 3);
      return sliced.map((m, i) => ({
        date: m.date,
        weight: m.weight,
        ma: ma3[i],
        goal: GOAL_WEIGHT,
      }));
    } else {
      return [];
    }
  }, [bodyMetrics, range, hasRealData]);

  const currentWeight = hasRealData ? bodyMetrics[0]?.weight : 0;
  const oldestWeight = hasRealData ? bodyMetrics[bodyMetrics.length - 1]?.weight : 0;
  const change = hasRealData ? currentWeight - oldestWeight : 0;

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
        {hasRealData ? (
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
        ) : (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt3)', fontSize: 13, background: 'var(--bg3)', borderRadius: 12 }}>
            Log your body weight to track historical trends and goals.
          </div>
        )}

        {/* Current stats row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Current', val: hasRealData ? `${currentWeight} kg` : '--', delta: null },
            { label: hasRealData ? `Change (${bodyMetrics.length}W)` : 'Change', val: hasRealData ? `${change > 0 ? '+' : ''}${change.toFixed(1)} kg` : '--', delta: 'neutral', good: change < 0 },
            { label: 'Weekly Rate', val: hasRealData && bodyMetrics.length > 1 ? `${(change / bodyMetrics.length).toFixed(2)} kg/wk` : '--', delta: 'down', good: true },
            { label: 'Goal', val: `${GOAL_WEIGHT} kg`, delta: null },
            { label: 'Remaining', val: `${Math.max(0, currentWeight - GOAL_WEIGHT).toFixed(1)} kg`, delta: null },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'var(--bg3)', borderRadius: 10 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: s.delta && s.delta !== 'neutral' ? (s.good ? 'var(--mint)' : 'var(--red)') : 'var(--txt)', marginBottom: 3 }}>{s.val}</div>
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
          <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--txt3)', fontSize: 13 }}>Measurement logging coming soon.</div>
        </div>

        {/* BF% Donut */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--txt)', marginBottom: 18, alignSelf: 'flex-start' }}>Body Composition</div>
          <div style={{ padding: '80px 10px', textAlign: 'center', color: 'var(--txt3)', fontSize: 13 }}>No composition data recorded.</div>
        </div>
      </div>

      {/* Progress Photos */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--txt)', marginBottom: 18 }}>Progress Photos</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ aspectRatio: '3/4', width: 120, borderRadius: 12, background: 'rgba(124,92,252,0.08)', border: `1px dashed var(--violet)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
            <div style={{ fontSize: 22, color: 'var(--violet2)' }}>+</div>
            <span style={{ fontSize: 11, color: 'var(--violet2)', fontWeight: 600 }}>Add Photo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
