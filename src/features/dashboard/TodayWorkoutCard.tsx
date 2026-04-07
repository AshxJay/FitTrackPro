import { useAppStore } from '../../shared/stores/appStore';
import { useNavigate } from 'react-router-dom';

export default function TodayWorkoutCard() {
  const { workoutHistory } = useAppStore();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const todayWorkout = workoutHistory.find(w => {
    const d = w.completedAt instanceof Date ? w.completedAt : new Date(w.completedAt!);
    return d.toISOString().split('T')[0] === today;
  });

  return (
    <div
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, transition: 'border-color 0.2s', alignSelf: 'start' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700 }}>Today's Session</div>
        {todayWorkout ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 20, fontSize: 11, fontWeight: 500, color: 'var(--mint)' }}>
            Completed ✓
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 20, fontSize: 11, fontWeight: 500, color: 'var(--txt3)' }}>
            Pending
          </div>
        )}
      </div>

      <div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
          {todayWorkout ? todayWorkout.name : "Ready to train?"}
        </div>
        <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 4 }}>
          {todayWorkout ? "You crushed it today." : "Log a session and hit your goals."}
        </div>
      </div>

      {todayWorkout ? (
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14, display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 2 }}>Volume</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', fontFamily: 'JetBrains Mono, monospace' }}>{todayWorkout.totalVolume}kg</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 2 }}>Duration</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', fontFamily: 'JetBrains Mono, monospace' }}>{Math.round((todayWorkout.duration || 0) / 60)} min</div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 24, textAlign: 'center', color: 'var(--txt3)', fontSize: 13 }}>
          No session logged for today yet.
        </div>
      )}

      {!todayWorkout && (
        <button
          onClick={() => navigate('/workout')}
          style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg,var(--violet),#a855f7)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 30px rgba(124,92,252,0.4)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          Go to Workout Logger
        </button>
      )}
    </div>
  );
}
