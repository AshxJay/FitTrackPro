import { useEffect, useRef } from 'react';
import { useWorkoutLogger } from '../../shared/stores/workoutLoggerStore';

const PRESETS = [60, 90, 120, 180];

export default function RestTimer() {
  const { session, cancelRestTimer, tickRestTimer, startRestTimer } = useWorkoutLogger();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const seconds = session?.restTimerSeconds ?? null;
  const max = session?.restTimerMax ?? 90;

  useEffect(() => {
    if (seconds !== null && seconds > 0) {
      intervalRef.current = setInterval(() => tickRestTimer(), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [seconds]);

  if (seconds === null) return null;

  const pct = seconds / max;
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);
  const isWarning = seconds <= 10;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, background: 'var(--bg4)', border: `1px solid ${isWarning ? 'rgba(255,107,53,0.4)' : 'var(--border2)'}`,
      borderRadius: 20, padding: '16px 24px', display: 'flex', alignItems: 'center',
      gap: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      animation: 'fadeUp 0.3s ease both',
    }}>
      {/* Ring */}
      <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--bg5)" strokeWidth="6" />
          <circle
            cx="48" cy="48" r={radius} fill="none"
            stroke={isWarning ? 'var(--orange)' : 'var(--violet)'}
            strokeWidth="6"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 500,
            color: isWarning ? 'var(--orange)' : 'var(--txt)',
            animation: isWarning ? 'pulseDot 1s infinite' : 'none',
          }}>{display}</div>
          <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2 }}>REST</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--txt2)', fontWeight: 500 }}>Rest Timer</div>

        {/* Preset buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => startRestTimer(p)}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11,
                background: max === p ? 'var(--violet)' : 'var(--bg5)',
                color: max === p ? '#fff' : 'var(--txt3)',
                border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace',
                transition: 'all 0.15s',
              }}
            >
              {p >= 60 ? `${p / 60}m` : `${p}s`}
            </button>
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={cancelRestTimer}
          style={{
            padding: '7px 16px', borderRadius: 8, fontSize: 12, border: '1px solid var(--border2)',
            background: 'transparent', color: 'var(--txt2)', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg5)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          Skip Rest →
        </button>
      </div>
    </div>
  );
}
