import { useEffect, useRef, useState } from 'react';
import { useWorkoutLogger } from '../../shared/stores/workoutLoggerStore';
import { mockSchedule } from '../../shared/lib/mockData';
import ExerciseCard from './ExerciseCard';
import RestTimer from './RestTimer';
import PRAlert from './PRAlert';
import WorkoutSummary from './WorkoutSummary';
import type { PersonalRecord } from '../../shared/types';

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function WorkoutLogger() {
  const { session, startSession, endSession, tickTimer } = useWorkoutLogger();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activePR, setActivePR] = useState<PersonalRecord | null>(null);
  const prevPRCount = useRef(0);

  // Global session timer
  useEffect(() => {
    if (session && !session.showSummary) {
      intervalRef.current = setInterval(() => tickTimer(), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [session?.showSummary]);

  // Detect new PRs and show alert
  useEffect(() => {
    if (!session) return;
    if (session.newPRs.length > prevPRCount.current) {
      setActivePR(session.newPRs[session.newPRs.length - 1]);
      prevPRCount.current = session.newPRs.length;
    }
  }, [session?.newPRs.length]);

  // Start a session if none active
  if (!session) {
    return <StartSessionScreen onStart={startSession} />;
  }

  if (session.showSummary) {
    return <WorkoutSummary />;
  }

  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* PR Alert */}
      {activePR && <PRAlert pr={activePR} onDismiss={() => setActivePR(null)} />}

      {/* Session Header */}
      <div style={{
        padding: '14px 28px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px' }}>{session.name}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 500, color: 'var(--mint)' }}>
              {formatTime(session.elapsedSeconds)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{completedSets}/{totalSets} sets</div>
            {session.newPRs.length > 0 && (
              <div style={{ padding: '2px 8px', background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)', borderRadius: 6, fontSize: 11, color: 'var(--gold)' }}>
                🏆 {session.newPRs.length} PR{session.newPRs.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={endSession}
          style={{
            padding: '10px 20px', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)',
            borderRadius: 10, color: 'var(--mint)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Syne, sans-serif', transition: 'all 0.2s', letterSpacing: '0.2px',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,160,0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,160,0.1)'; }}
        >
          Finish Workout ✓
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--bg5)', flexShrink: 0 }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--violet), var(--mint))', width: `${progressPct}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Exercises list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 140 }}>
        {session.exercises.map((ex, idx) => (
          <ExerciseCard key={ex.exerciseId} exercise={ex} exerciseIdx={idx} />
        ))}
      </div>

      {/* Rest timer overlay */}
      <RestTimer />
    </div>
  );
}

// --- Start Session Screen ---
function StartSessionScreen({ onStart }: { onStart: (name: string, exercises: any[]) => void }) {
  const today = mockSchedule[0];

  const handleStart = (workout: typeof today) => {
    onStart(
      workout.name,
      workout.exercises.map((ex, i) => ({
        exerciseId: `ex_${ex.name.toLowerCase().replace(/\s+/g, '_')}`,
        exerciseName: ex.name,
        sets: Array.from({ length: ex.sets }, (_, j) => ({
          setNumber: j + 1, weight: 0, reps: 0,
          completed: false, isWarmup: j === 0,
          timestamp: new Date(),
        })),
        notes: '', order: i,
      }))
    );
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Start a Session</div>
        <div style={{ fontSize: 13, color: 'var(--txt3)', marginTop: 4 }}>Pick a workout to begin logging</div>
      </div>

      {/* Quick start — today's workout */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12 }}>Scheduled Today</div>
        <div
          onClick={() => handleStart(today)}
          style={{
            background: 'linear-gradient(135deg, rgba(124,92,252,0.1), rgba(0,229,160,0.05))',
            border: '1px solid rgba(124,92,252,0.3)', borderRadius: 14,
            padding: 20, cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,92,252,0.6)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,92,252,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800 }}>{today.name}</div>
            <div style={{ padding: '4px 10px', background: 'rgba(124,92,252,0.2)', borderRadius: 6, fontSize: 11, color: 'var(--violet2)', fontWeight: 600 }}>Today</div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--txt3)' }}>⏱ ~{today.estimatedDuration} min</span>
            <span style={{ fontSize: 12, color: 'var(--txt3)' }}>🏋️ {today.exercises.length} exercises</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
            {today.exercises.map(ex => (
              <div key={ex.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--txt2)' }}>
                <span>{ex.name}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--txt3)' }}>{ex.sets}×{ex.reps}</span>
              </div>
            ))}
          </div>
          <button
            style={{
              width: '100%', padding: 13, background: 'linear-gradient(135deg,var(--violet),#a855f7)',
              border: 'none', borderRadius: 10, color: '#fff',
              fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            Start {today.name}
          </button>
        </div>
      </div>

      {/* Rest of weekly schedule */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12 }}>This Week's Plan</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mockSchedule.slice(1).filter(w => w.type !== 'cardio').map(w => (
            <div
              key={w.id}
              onClick={() => handleStart(w)}
              style={{
                background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
            >
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700 }}>{w.name}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{w.exercises.length} exercises · ~{w.estimatedDuration} min</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--txt3)" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
