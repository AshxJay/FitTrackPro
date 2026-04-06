import { useState } from 'react';

const DEVICES = [
  { name: 'Apple Watch', icon: '⌚', desc: 'Sync workouts, heart rate & activity rings', connected: false },
  { name: 'Garmin', icon: '🟠', desc: 'Import GPS runs, VO₂max & HRV data', connected: false },
  { name: 'Whoop', icon: '💪', desc: 'Recovery, strain & sleep tracking', connected: false },
  { name: 'Google Fit', icon: '💚', desc: 'Android health data & step tracking', connected: false },
];

const CARDIO_STATS = [
  { label: 'Total Distance', val: '124.6 km', icon: '📍', delta: '+18.2 km', good: true },
  { label: 'Avg Pace', val: '5:32 /km', icon: '⏱️', delta: '−0:18 /km', good: true },
  { label: 'VO₂ Max (est.)', val: '48.3 ml/kg', icon: '🫁', delta: '+1.2', good: true },
  { label: 'Sessions', val: '12', icon: '🏃', delta: '+3 this month', good: true },
];

export default function CardioTab() {
  const [connected, setConnected] = useState<string[]>([]);

  const toggle = (name: string) =>
    setConnected(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {CARDIO_STATS.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px' }}>
            <div style={{ fontSize: 26, marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--txt)', marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: s.good ? 'var(--mint)' : 'var(--red)', fontWeight: 600, background: s.good ? 'rgba(0,229,160,0.1)' : 'rgba(255,59,92,0.1)', padding: '3px 10px', borderRadius: 99, display: 'inline-block' }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* No device connected state */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--txt)', marginBottom: 8 }}>Connect a wearable device</div>
          <div style={{ fontSize: 13, color: 'var(--txt3)', maxWidth: 360, margin: '0 auto', lineHeight: 1.7 }}>
            Sync your wearables to automatically import cardio sessions, heart rate data, VO₂max estimates, and recovery metrics.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {DEVICES.map(d => {
            const isConnected = connected.includes(d.name);
            return (
              <div key={d.name} style={{ padding: '20px', borderRadius: 14, background: 'var(--bg3)', border: `1px solid ${isConnected ? 'var(--mint)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: isConnected ? 'rgba(0,229,160,0.15)' : 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{d.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--txt)', marginBottom: 3 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{d.desc}</div>
                </div>
                <button
                  onClick={() => toggle(d.name)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, background: isConnected ? 'rgba(0,229,160,0.15)' : 'var(--violet)', color: isConnected ? 'var(--mint)' : '#fff', transition: 'all 0.2s', flexShrink: 0 }}
                >
                  {isConnected ? '✓ Connected' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>

        {connected.length > 0 && (
          <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint)' }}>{connected.join(', ')} connected</div>
              <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 2 }}>First sync will happen automatically within the next few minutes.</div>
            </div>
          </div>
        )}
      </div>

      {/* Zone 2 info card */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1/-1', fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--txt)', marginBottom: 8 }}>Heart Rate Zones</div>
        {[
          { zone: 'Z1', name: 'Recovery', bpm: '< 114', color: '#6b7280', pct: 8 },
          { zone: 'Z2', name: 'Aerobic', bpm: '114–133', color: 'var(--mint)', pct: 45 },
          { zone: 'Z3', name: 'Tempo', bpm: '133–152', color: 'var(--gold)', pct: 28 },
          { zone: 'Z4', name: 'Threshold', bpm: '152–171', color: 'var(--orange)', pct: 14 },
          { zone: 'Z5', name: 'VO₂Max', bpm: '> 171', color: 'var(--red)', pct: 5 },
        ].map(z => (
          <div key={z.zone} style={{ textAlign: 'center', padding: '14px 10px', background: 'var(--bg3)', borderRadius: 12, borderTop: `3px solid ${z.color}` }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 800, color: z.color, marginBottom: 4 }}>{z.pct}%</div>
            <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--txt)', marginBottom: 2 }}>{z.zone} · {z.name}</div>
            <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{z.bpm} bpm</div>
          </div>
        ))}
      </div>
    </div>
  );
}
