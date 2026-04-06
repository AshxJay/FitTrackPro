import { mockSchedule } from '../../shared/lib/mockData';

const muscleColors: Record<string, { bg: string; color: string }> = {
  chest:     { bg: 'rgba(255,107,53,0.15)', color: '#ff6b35' },
  triceps:   { bg: 'rgba(124,92,252,0.15)', color: '#9b7ffe' },
  shoulders: { bg: 'rgba(0,229,160,0.15)',  color: '#00e5a0' },
  back:      { bg: 'rgba(90,180,255,0.15)', color: '#5ab4ff' },
  biceps:    { bg: 'rgba(255,200,80,0.15)', color: '#f5c842' },
  legs:      { bg: 'rgba(255,80,120,0.15)', color: '#ff3b5c' },
  glutes:    { bg: 'rgba(200,80,255,0.15)', color: '#c850ff' },
  core:      { bg: 'rgba(80,200,255,0.15)', color: '#50c8ff' },
};

export default function TodayWorkoutCard() {
  const todayWorkout = mockSchedule[0]; // Monday = Push Day A

  return (
    <div
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700 }}>Today's Session</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 20, fontSize: 11, fontWeight: 500, color: 'var(--mint)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint)', animation: 'pulseDot 2s infinite' }} />
          Scheduled
        </div>
      </div>

      {/* Workout name */}
      <div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.2 }}>{todayWorkout.name}</div>
        <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 4 }}>Upper Hypertrophy Block · Week 9</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          {[
            { icon: '⏱', text: `~${todayWorkout.estimatedDuration} min` },
            { icon: '🏋️', text: `${todayWorkout.exercises.length} exercises` },
            { icon: '📊', text: '28 sets' },
          ].map(chip => (
            <div key={chip.text} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'var(--bg4)', borderRadius: 6, fontSize: 11, color: 'var(--txt2)' }}>
              <span style={{ fontSize: 12 }}>{chip.icon}</span> {chip.text}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {todayWorkout.muscleGroups.map(m => (
            <span key={m} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: muscleColors[m]?.bg ?? 'var(--bg4)', color: muscleColors[m]?.color ?? 'var(--txt2)' }}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </span>
          ))}
        </div>
      </div>

      {/* Exercise preview */}
      <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Exercise Preview</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {todayWorkout.exercises.slice(0, 3).map((ex, i) => (
            <div key={ex.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: i === 0 ? 'var(--txt)' : 'var(--txt3)' }}>
              <span>{ex.name}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: i === 0 ? 'var(--violet2)' : 'var(--txt3)' }}>{ex.sets}×{ex.reps}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--txt3)' }}>+{todayWorkout.exercises.length - 3} more exercises...</div>
        </div>
      </div>

      {/* Recovery gauge */}
      <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
          <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(0,229,160,0.1)" strokeWidth="5" />
            <circle cx="26" cy="26" r="20" fill="none" stroke="var(--mint)" strokeWidth="5"
              strokeDasharray="125.66" strokeDashoffset="25.13" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 500, color: 'var(--mint)' }}>80</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 2 }}>Recovery Score</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--mint)' }}>Ready to Train</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2, lineHeight: 1.4 }}>HRV optimal — high intensity cleared</div>
        </div>
      </div>

      {/* CTA */}
      <button
        style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg,var(--violet),#a855f7)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 30px rgba(124,92,252,0.4)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
        onMouseDown={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'}
        onMouseUp={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
        Start Workout
      </button>
    </div>
  );
}
