import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { strengthHistory } from '../../shared/lib/mockData';

type Lift = 'bench' | 'squat' | 'deadlift' | 'ohp';

// Strength standards in kg (male, body weight ~80 kg)
const STANDARDS = {
  bench:    { Beginner: 60,  Novice: 80,  Intermediate: 100, Advanced: 130, Elite: 160 },
  squat:    { Beginner: 70,  Novice: 100, Intermediate: 135, Advanced: 170, Elite: 210 },
  deadlift: { Beginner: 90,  Novice: 120, Intermediate: 160, Advanced: 200, Elite: 245 },
  ohp:      { Beginner: 35,  Novice: 50,  Intermediate: 65,  Advanced: 88,  Elite: 110 },
};

const CURRENT: Record<Lift, number> = { bench: 103, squat: 140, deadlift: 175, ohp: 70 };
const LIFT_LABELS: Record<Lift, string> = { bench: 'Bench Press', squat: 'Back Squat', deadlift: 'Deadlift', ohp: 'Overhead Press' };
const LIFT_COLORS: Record<Lift, string> = { bench: 'var(--violet2)', squat: 'var(--mint)', deadlift: 'var(--gold)', ohp: 'var(--orange)' };

const MUSCLE_FREQ = [
  { muscle: 'Chest', freq: 2 }, { muscle: 'Back', freq: 2 }, { muscle: 'Shoulders', freq: 3 },
  { muscle: 'Biceps', freq: 2 }, { muscle: 'Triceps', freq: 2 }, { muscle: 'Legs', freq: 1 },
  { muscle: 'Core', freq: 1 },
];

function StandardsBar({ lift }: { lift: Lift }) {
  const std = STANDARDS[lift];
  const current = CURRENT[lift];
  const max = std.Elite * 1.1;
  const pct = (v: number) => Math.min((v / max) * 100, 100);
  const LEVELS = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'] as const;
  const COLORS = ['#555', '#6b7280', '#7c5cfc', '#00c87a', '#f5c842'];

  // Find current level
  let levelIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (current >= std[LEVELS[i]]) { levelIdx = i; break; }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--txt)' }}>{LIFT_LABELS[lift]}</span>
          <span style={{ marginLeft: 10, fontSize: 12, color: LIFT_COLORS[lift], fontWeight: 700, background: `${LIFT_COLORS[lift]}22`, padding: '2px 10px', borderRadius: 99 }}>{LEVELS[levelIdx]}</span>
        </div>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--txt)' }}>{current} kg</div>
      </div>
      {/* Bar */}
      <div style={{ position: 'relative', height: 28, borderRadius: 10, overflow: 'hidden' }}>
        {/* Color gradient zones */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {LEVELS.map((lvl, i) => {
            const start = i === 0 ? 0 : pct(std[LEVELS[i - 1]]);
            const end = pct(std[lvl]);
            const width = end - start;
            return (
              <div key={lvl} style={{ width: `${width}%`, height: '100%', background: COLORS[i], opacity: 0.6 }} />
            );
          })}
          <div style={{ flex: 1, height: '100%', background: '#f5c842', opacity: 0.7 }} />
        </div>
        {/* Level markers */}
        {LEVELS.map(lvl => (
          <div key={lvl} style={{ position: 'absolute', left: `${pct(std[lvl])}%`, top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.4)' }} />
        ))}
        {/* Current position marker */}
        <div style={{
          position: 'absolute', left: `${pct(current)}%`, top: '50%', transform: 'translate(-50%,-50%)',
          width: 14, height: 14, borderRadius: '50%', background: '#fff', border: '3px solid #000',
          boxShadow: '0 0 0 3px var(--violet)', zIndex: 2,
        }} />
      </div>
      {/* Level labels */}
      <div style={{ position: 'relative', height: 18, marginTop: 4 }}>
        {LEVELS.map((lvl, i) => (
          <div key={lvl} style={{ position: 'absolute', left: `${pct(std[lvl])}%`, transform: 'translateX(-50%)', fontSize: 10, color: 'var(--txt3)', whiteSpace: 'nowrap' }}>
            {lvl}<br />{std[lvl]}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StrengthTab() {
  const [activeLift, setActiveLift] = useState<Lift>('bench');

  const chartData = strengthHistory.labels.map((l, i) => ({
    date: l,
    bench: strengthHistory.bench[i],
    squat: strengthHistory.squat[i],
    deadlift: strengthHistory.deadlift[i],
    ohp: strengthHistory.ohp[i],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: 'var(--txt3)', marginBottom: 6 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ color: p.stroke, marginBottom: 3 }}>
            {LIFT_LABELS[p.dataKey as Lift] || p.dataKey}: <strong>{p.value} kg</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Strength Standards */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--txt)', marginBottom: 6 }}>Strength Standards</div>
        <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 24 }}>Relative to bodyweight (~80 kg male). Current 1RM estimates.</div>
        {(['bench', 'squat', 'deadlift', 'ohp'] as Lift[]).map(lift => (
          <StandardsBar key={lift} lift={lift} />
        ))}
      </div>

      {/* Lift Progression */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--txt)', marginBottom: 2 }}>Lift Progression</div>
            <div style={{ fontSize: 12, color: 'var(--txt3)' }}>Estimated 1RM over 14 weeks</div>
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', padding: 4, borderRadius: 10 }}>
            {(['bench', 'squat', 'deadlift', 'ohp'] as Lift[]).map(l => (
              <button key={l} onClick={() => setActiveLift(l)} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', background: activeLift === l ? LIFT_COLORS[l] : 'transparent', color: activeLift === l ? '#fff' : 'var(--txt3)', transition: 'all 0.2s' }}>
                {l === 'ohp' ? 'OHP' : l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--txt3)', fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fill: 'var(--txt3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={activeLift} stroke={LIFT_COLORS[activeLift]} strokeWidth={2.5} dot={{ fill: LIFT_COLORS[activeLift], r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {(['bench', 'squat', 'deadlift', 'ohp'] as Lift[]).map(l => {
            const gains = CURRENT[l] - (strengthHistory as any)[l][0];
            return (
              <div key={l} style={{ flex: 1, textAlign: 'center', background: 'var(--bg3)', borderRadius: 10, padding: '10px' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: LIFT_COLORS[l] }}>+{gains} kg</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{l === 'ohp' ? 'OHP' : l}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Muscle Frequency */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--txt)', marginBottom: 4 }}>Weekly Muscle Frequency</div>
        <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 20 }}>Optimal range: 2–4 sessions/week per muscle group</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MUSCLE_FREQ.map(m => {
            const isOptimal = m.freq >= 2;
            const barPct = (m.freq / 4) * 100;
            return (
              <div key={m.muscle} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 90, fontSize: 13, color: 'var(--txt2)', flexShrink: 0 }}>{m.muscle}</div>
                <div style={{ flex: 1, height: 8, background: 'var(--bg4)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${barPct}%`, height: '100%', background: isOptimal ? 'var(--mint)' : 'var(--orange)', borderRadius: 99, transition: 'width 0.5s' }} />
                </div>
                <div style={{ width: 60, fontSize: 12, color: isOptimal ? 'var(--mint)' : 'var(--orange)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {m.freq}×/wk
                </div>
                <div style={{ fontSize: 11, width: 70, padding: '2px 8px', borderRadius: 99, background: isOptimal ? 'rgba(0,229,160,0.1)' : 'rgba(255,107,53,0.12)', color: isOptimal ? 'var(--mint)' : 'var(--orange)', fontWeight: 600, textAlign: 'center' }}>
                  {isOptimal ? 'Optimal' : 'Low'}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.15)', borderRadius: 10, fontSize: 12, color: 'var(--orange)' }}>
          ⚠️ Legs and Core are below the optimal frequency. Consider adding a 2nd session this week.
        </div>
      </div>
    </div>
  );
}
