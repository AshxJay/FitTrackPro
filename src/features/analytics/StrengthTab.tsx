import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { strengthHistory } from '../../shared/lib/mockData';
import { useAppStore } from '../../shared/stores/appStore';

type Lift = 'bench' | 'squat' | 'deadlift' | 'ohp';

// Strength standards in kg (male, body weight ~80 kg)
const STANDARDS = {
  bench:    { Beginner: 60,  Novice: 80,  Intermediate: 100, Advanced: 130, Elite: 160 },
  squat:    { Beginner: 70,  Novice: 100, Intermediate: 135, Advanced: 170, Elite: 210 },
  deadlift: { Beginner: 90,  Novice: 120, Intermediate: 160, Advanced: 200, Elite: 245 },
  ohp:      { Beginner: 35,  Novice: 50,  Intermediate: 65,  Advanced: 88,  Elite: 110 },
};

// Module-level mock fallback (used when no real PRs exist)
const MOCK_CURRENT: Record<Lift, number> = { bench: 103, squat: 140, deadlift: 175, ohp: 70 };
const LIFT_LABELS: Record<Lift, string> = { bench: 'Bench Press', squat: 'Back Squat', deadlift: 'Deadlift', ohp: 'Overhead Press' };
const LIFT_COLORS: Record<Lift, string> = { bench: 'var(--violet2)', squat: 'var(--mint)', deadlift: 'var(--gold)', ohp: 'var(--orange)' };

// Map exercise names to lift keys for PR detection
const EXERCISE_TO_LIFT: Record<string, Lift> = {
  'bench press': 'bench', 'flat barbell bench press': 'bench', 'incline barbell press': 'bench', 'db flat press': 'bench',
  'back squat': 'squat', 'squat': 'squat',
  'deadlift': 'deadlift', 'romanian deadlift': 'deadlift',
  'overhead press': 'ohp', 'ohp': 'ohp', 'military press': 'ohp', 'arnold press': 'ohp',
};

// ── Standards Bar ─────────────────────────────────────────────────────────────
function StandardsBar({ lift, current }: { lift: Lift; current: number }) {
  const std = STANDARDS[lift];
  const max = std.Elite * 1.1;
  const pct = (v: number) => Math.min((v / max) * 100, 100);
  const LEVELS = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'] as const;
  const COLORS = ['#555', '#6b7280', '#7c5cfc', '#00c87a', '#f5c842'];

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
      <div style={{ position: 'relative', height: 28, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {LEVELS.map((lvl, i) => {
            const start = i === 0 ? 0 : pct(std[LEVELS[i - 1]]);
            const end = pct(std[lvl]);
            return <div key={lvl} style={{ width: `${end - start}%`, height: '100%', background: COLORS[i], opacity: 0.6 }} />;
          })}
          <div style={{ flex: 1, height: '100%', background: '#f5c842', opacity: 0.7 }} />
        </div>
        {LEVELS.map(lvl => (
          <div key={lvl} style={{ position: 'absolute', left: `${pct(std[lvl])}%`, top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.4)' }} />
        ))}
        <div style={{ position: 'absolute', left: `${pct(current)}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: '#fff', border: '3px solid #000', boxShadow: '0 0 0 3px var(--violet)', zIndex: 2 }} />
      </div>
      <div style={{ position: 'relative', height: 18, marginTop: 4 }}>
        {LEVELS.map(lvl => (
          <div key={lvl} style={{ position: 'absolute', left: `${pct(std[lvl])}%`, transform: 'translateX(-50%)', fontSize: 10, color: 'var(--txt3)', whiteSpace: 'nowrap' }}>
            {lvl}<br />{std[lvl]}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StrengthTab() {
  const { workoutHistory } = useAppStore();
  const [activeLift, setActiveLift] = useState<Lift>('bench');

  // Build 1RM map from real PR history; fall back to mock values
  const CURRENT = useMemo(() => {
    const result = { ...MOCK_CURRENT };
    workoutHistory.forEach(s => {
      (s.prsBreached ?? []).forEach(pr => {
        const key = EXERCISE_TO_LIFT[pr.exerciseName.toLowerCase()];
        if (key && pr.estimatedOneRM > result[key]) {
          result[key] = Math.round(pr.estimatedOneRM);
        }
      });
    });
    return result;
  }, [workoutHistory]);

  const hasRealPRs = workoutHistory.some(s =>
    (s.prsBreached ?? []).some(pr => EXERCISE_TO_LIFT[pr.exerciseName.toLowerCase()])
  );

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
      {hasRealPRs && (
        <div style={{ padding: '12px 18px', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 10, fontSize: 13, color: 'var(--mint)', display: 'flex', alignItems: 'center', gap: 8 }}>
          ✅ Showing real 1RM estimates from your logged PRs
        </div>
      )}

      {/* Strength Standards */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--txt)', marginBottom: 6 }}>Strength Standards</div>
        <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 24 }}>
          {hasRealPRs ? 'Based on your logged PR data' : 'Relative to bodyweight (~80 kg male). Current 1RM estimates.'}
        </div>
        {(['bench', 'squat', 'deadlift', 'ohp'] as Lift[]).map(lift => (
          <StandardsBar key={lift} lift={lift} current={CURRENT[lift]} />
        ))}
      </div>

      {/* Lift Progression */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--txt)', marginBottom: 2 }}>Lift Progression</div>
            <div style={{ fontSize: 12, color: 'var(--txt3)' }}>Estimated 1RM over time (baseline trend)</div>
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
    </div>
  );
}
