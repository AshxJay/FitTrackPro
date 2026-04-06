import { useWorkoutLogger } from '../../shared/stores/workoutLoggerStore';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const MOOD_EMOJIS = ['😤', '😐', '🙂', '😄', '🔥'];
const MOOD_LABELS = ['Struggled', 'Okay', 'Good', 'Great', 'Beast Mode'];

export default function WorkoutSummary() {
  const { session, dismissSummary } = useWorkoutLogger();
  if (!session) return null;

  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const totalReps = session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).reduce((a, s) => a + s.reps, 0), 0);
  const totalVolume = session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).reduce((a, s) => a + s.weight * s.reps, 0), 0);
  const estCalories = Math.round(session.elapsedSeconds / 60 * 7.5);

  const stats = [
    { label: 'Duration',    value: formatDuration(session.elapsedSeconds), color: 'var(--violet2)' },
    { label: 'Total Volume', value: `${Math.round(totalVolume).toLocaleString()} kg`, color: 'var(--mint)' },
    { label: 'Sets Done',   value: `${totalSets}`,       color: 'var(--orange)' },
    { label: 'Total Reps',  value: `${totalReps}`,       color: 'var(--gold)' },
    { label: 'Est. Calories', value: `~${estCalories}`,  color: 'var(--orange)' },
    { label: 'PRs Broken',  value: `${session.newPRs.length}`, color: 'var(--gold)' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(9,9,15,0.95)', backdropFilter: 'blur(16px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, overflowY: 'auto',
      animation: 'fadeUp 0.4s ease both',
    }}>
      {/* Trophy + heading */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: '-1px' }}>Workout Complete!</div>
        <div style={{ fontSize: 15, color: 'var(--txt3)', marginTop: 6 }}>{session.name}</div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, width: '100%', maxWidth: 560, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 500, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* PRs */}
      {session.newPRs.length > 0 && (
        <div style={{ width: '100%', maxWidth: 560, background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 10 }}>🏆 Personal Records</div>
          {session.newPRs.map(pr => (
            <div key={pr.exerciseId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'var(--txt2)' }}>{pr.exerciseName}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--gold)' }}>{pr.weight}kg × {pr.reps}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mood selector */}
      <div style={{ width: '100%', maxWidth: 560, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 12 }}>How did the session feel?</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {MOOD_EMOJIS.map((emoji, i) => (
            <button key={i} style={{ flex: 1, padding: '12px 0', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg4)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--violet)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)'; }}
            >
              <span style={{ fontSize: 22 }}>{emoji}</span>
              <span style={{ fontSize: 10, color: 'var(--txt3)' }}>{MOOD_LABELS[i]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Done button */}
      <button
        onClick={dismissSummary}
        style={{
          width: '100%', maxWidth: 560, padding: 15,
          background: 'linear-gradient(135deg,var(--violet),#a855f7)',
          border: 'none', borderRadius: 12, color: '#fff',
          fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700,
          cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.2px',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 30px rgba(124,92,252,0.4)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
      >
        Save & Return to Dashboard
      </button>
    </div>
  );
}
