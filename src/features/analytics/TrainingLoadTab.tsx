import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';

const WEEKS = Array.from({ length: 16 }, (_, i) => {
  const base = 8000 + Math.sin(i * 0.5) * 1500;
  const acute = Math.round(base + (i % 3 === 0 ? -800 : 400));
  const chronic = Math.round(8000 + i * 120);
  return { week: `W${i + 1}`, acute, chronic };
});

const ACWR = 1.12;

const RPE_DATA = [
  { session: 'S1', rpe: 6.5 }, { session: 'S2', rpe: 7 }, { session: 'S3', rpe: 7.5 },
  { session: 'S4', rpe: 8 }, { session: 'S5', rpe: 7 }, { session: 'S6', rpe: 7.5 },
  { session: 'S7', rpe: 8.5 }, { session: 'S8', rpe: 7 }, { session: 'S9', rpe: 7.5 },
  { session: 'S10', rpe: 9 }, { session: 'S11', rpe: 6.5 }, { session: 'S12', rpe: 7 },
  { session: 'S13', rpe: 8 }, { session: 'S14', rpe: 7.5 },
];

function getStatus(acwr: number) {
  if (acwr < 0.8) return { label: 'Undertraining', color: 'var(--gold)', desc: 'Load is too low. Increase volume gradually.', bg: 'rgba(245,200,66,0.1)' };
  if (acwr <= 1.3) return { label: 'Optimal', color: 'var(--mint)', desc: 'Training load is in the sweet spot. Keep it up!', bg: 'rgba(0,229,160,0.1)' };
  if (acwr <= 1.5) return { label: 'Caution', color: 'var(--orange)', desc: 'Load is elevated. Monitor recovery closely.', bg: 'rgba(255,107,53,0.1)' };
  return { label: 'High Risk', color: 'var(--red)', desc: 'Injury risk elevated. Consider deload.', bg: 'rgba(255,59,92,0.1)' };
}

function ACWRGauge({ value }: { value: number }) {
  const status = getStatus(value);
  const toRad = (d: number) => (d * Math.PI) / 180;
  const r = 78; const cx = 110; const cy = 110;
  const sweepStart = 150;
  const angleDeg = Math.min((value / 2.0) * 240, 240);

  const arcPoint = (deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  const arcPath = (startDeg: number, endDeg: number) => {
    const s = arcPoint(startDeg); const e = arcPoint(endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const zones = [
    { color: '#f5c842', start: sweepStart, end: sweepStart + 96 },
    { color: '#00e5a0', start: sweepStart + 96, end: sweepStart + 156 },
    { color: '#ff6b35', start: sweepStart + 156, end: sweepStart + 180 },
    { color: '#ff3b5c', start: sweepStart + 180, end: sweepStart + 240 },
  ];

  const needle = arcPoint(sweepStart + angleDeg);

  return (
    <svg width={220} height={175} viewBox="0 0 220 175">
      <path d={arcPath(sweepStart, sweepStart + 240)} fill="none" stroke="var(--bg4)" strokeWidth={20} strokeLinecap="round" />
      {zones.map((z, i) => <path key={i} d={arcPath(z.start, z.end)} fill="none" stroke={z.color} strokeWidth={20} opacity={0.45} />)}
      <path d={arcPath(sweepStart, sweepStart + angleDeg)} fill="none" stroke={status.color} strokeWidth={20} strokeLinecap="round" />
      <circle cx={needle.x} cy={needle.y} r={7} fill={status.color} />
      <circle cx={cx} cy={cy} r={10} fill="var(--bg3)" stroke={status.color} strokeWidth={2.5} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--txt)" fontSize="26" fontWeight="800" fontFamily="Syne,sans-serif">{value}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={status.color} fontSize="13" fontWeight="700" fontFamily="DM Sans,sans-serif">{status.label}</text>
      <text x={38} y={168} textAnchor="middle" fill="var(--txt3)" fontSize="10">0.0</text>
      <text x={110} y={32} textAnchor="middle" fill="var(--mint)" fontSize="10">1.3</text>
      <text x={182} y={168} textAnchor="middle" fill="var(--txt3)" fontSize="10">2.0</text>
    </svg>
  );
}

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--txt3)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.fill || p.stroke || 'var(--txt)', marginBottom: 3 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function TrainingLoadTab() {
  const status = getStatus(ACWR);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ACWR */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--txt)', marginBottom: 2, alignSelf: 'flex-start' }}>ACWR Gauge</div>
          <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 12, alignSelf: 'flex-start' }}>7d avg ÷ 28d avg</div>
          <ACWRGauge value={ACWR} />
        </div>
        <div>
          <div style={{ padding: '16px 18px', borderRadius: 12, background: status.bg, border: `1px solid ${status.color}44`, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 4 }}>Current Status</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: status.color, marginBottom: 6 }}>{status.label}</div>
            <div style={{ fontSize: 13, color: 'var(--txt2)', lineHeight: 1.6 }}>{status.desc}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[{ label: '7-Day Avg Volume', val: '9,856 kg', color: 'var(--violet2)' }, { label: '28-Day Avg Volume', val: '8,800 kg', color: 'var(--txt2)' }, { label: 'ACWR Ratio', val: String(ACWR), color: status.color }].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--txt2)' }}>{s.label}</span>
                <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Volume Bars */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--txt)', marginBottom: 4 }}>16-Week Load History</div>
        <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 16 }}>Acute (7-day) vs Chronic (28-day) training volume</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          {[{ c: 'var(--violet)', l: 'Acute' }, { c: 'var(--mint)', l: 'Chronic' }].map(x => (
            <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: x.c }} />
              <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{x.l}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={WEEKS} barCategoryGap="30%" barGap={3} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: 'var(--txt3)', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tick={{ fill: 'var(--txt3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TT />} />
            <Bar dataKey="acute" name="Acute" fill="var(--violet)" radius={[4, 4, 0, 0]} opacity={0.85} />
            <Bar dataKey="chronic" name="Chronic" fill="var(--mint)" radius={[4, 4, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RPE Trend */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--txt)', marginBottom: 4 }}>RPE Trend</div>
        <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 16 }}>Perceived exertion per session · last 14 sessions</div>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={RPE_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="session" tick={{ fill: 'var(--txt3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[4, 10]} ticks={[4, 6, 8, 9, 10]} tick={{ fill: 'var(--txt3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TT />} />
            <ReferenceLine y={6} stroke="var(--mint)" strokeDasharray="5 3" strokeWidth={1} />
            <ReferenceLine y={8} stroke="var(--mint)" strokeDasharray="5 3" strokeWidth={1} label={{ value: 'Optimal 6–8', position: 'right', fill: 'var(--mint)', fontSize: 9 }} />
            <ReferenceLine y={9} stroke="var(--red)" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: 'Danger >9', position: 'right', fill: 'var(--red)', fontSize: 9 }} />
            <Line type="monotone" dataKey="rpe" stroke="var(--violet2)" strokeWidth={2.5} name="RPE"
              dot={({ cx, cy, payload }: any) => (
                <circle key={cx} cx={cx} cy={cy} r={4} fill={payload.rpe >= 9 ? 'var(--red)' : 'var(--violet2)'} stroke="var(--bg)" strokeWidth={1.5} />
              )}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
