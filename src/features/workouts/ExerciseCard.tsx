import { useState } from 'react';
import { useWorkoutLogger } from '../../shared/stores/workoutLoggerStore';
import type { ExerciseLog } from '../../shared/types';

interface ExerciseCardProps {
  exercise: ExerciseLog;
  exerciseIdx: number;
}

const RPE_COLORS: Record<number, string> = {
  1: '#555575', 2: '#555575', 3: '#5ab4ff', 4: '#5ab4ff', 5: '#00e5a0',
  6: '#00e5a0', 7: '#f5c842', 8: '#ff6b35', 9: '#ff3b5c', 10: '#ff3b5c',
};

// Mock previous bests
const PREV_BESTS: Record<string, { weight: number; reps: number }> = {
  'Flat Barbell Bench Press': { weight: 100, reps: 5 },
  'Incline DB Press':         { weight: 38, reps: 10 },
  'Cable Flyes':              { weight: 22.5, reps: 12 },
  'Overhead Press':           { weight: 70, reps: 4 },
  'Lateral Raises':           { weight: 16, reps: 15 },
  'Tricep Pushdowns':         { weight: 40, reps: 12 },
  'Back Squat':               { weight: 137.5, reps: 3 },
  'Deadlift':                 { weight: 172.5, reps: 3 },
};

export default function ExerciseCard({ exercise, exerciseIdx }: ExerciseCardProps) {
  const { addSet, updateSet, toggleSetComplete, addNote } = useWorkoutLogger();
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState(exercise.notes);
  const prevBest = PREV_BESTS[exercise.exerciseName];

  const completedSets = exercise.sets.filter(s => s.completed).length;
  const totalSets = exercise.sets.length;

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14,
      overflow: 'hidden', transition: 'border-color 0.2s',
    }}>
      {/* Card Header */}
      <div style={{
        padding: '14px 18px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid var(--border)',
        background: completedSets === totalSets && totalSets > 0 ? 'rgba(0,229,160,0.04)' : 'transparent',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' }}>
              {exercise.exerciseName}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--txt3)' }}>
                {completedSets}/{totalSets} sets done
              </span>
              {prevBest && (
                <span style={{ fontSize: 11, color: 'var(--txt3)' }}>
                  · Prev best: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--violet2)' }}>{prevBest.weight}kg × {prevBest.reps}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress ring */}
        <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
          <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--bg5)" strokeWidth="3" />
            <circle cx="18" cy="18" r="14" fill="none"
              stroke={completedSets === totalSets && totalSets > 0 ? 'var(--mint)' : 'var(--violet)'}
              strokeWidth="3"
              strokeDasharray={2 * Math.PI * 14}
              strokeDashoffset={2 * Math.PI * 14 * (1 - (totalSets > 0 ? completedSets / totalSets : 0))}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 500 }}>
            {totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Sets Table */}
      <div style={{ padding: '0 18px' }}>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 80px 70px 60px 32px', gap: 8, alignItems: 'center', padding: '10px 0 6px', borderBottom: '1px solid var(--border)' }}>
          {['Set', 'Previous', 'kg', 'Reps', 'RPE', ''].map(h => (
            <div key={h} style={{ fontSize: 10, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>{h}</div>
          ))}
        </div>

        {/* Set rows */}
        {exercise.sets.map((set, setIdx) => (
          <div
            key={setIdx}
            style={{
              display: 'grid', gridTemplateColumns: '28px 1fr 80px 70px 60px 32px',
              gap: 8, alignItems: 'center', padding: '8px 0',
              borderBottom: setIdx < exercise.sets.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              opacity: set.completed ? 0.6 : 1,
              transition: 'all 0.2s',
              background: set.completed ? 'rgba(0,229,160,0.02)' : 'transparent',
              borderRadius: 6,
            }}
          >
            {/* Set number */}
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: set.isWarmup ? 'var(--orange)' : 'var(--txt3)', textAlign: 'center' }}>
              {set.isWarmup ? 'W' : set.setNumber}
            </div>

            {/* Previous best ghost */}
            <div style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: 'JetBrains Mono, monospace' }}>
              {prevBest ? `${prevBest.weight}kg × ${prevBest.reps}` : '—'}
            </div>

            {/* Weight input */}
            <input
              type="number"
              value={set.weight || ''}
              placeholder={prevBest ? `${prevBest.weight}` : '0'}
              disabled={set.completed}
              onChange={e => updateSet(exerciseIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
              onFocus={e => e.target.select()}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6,
                padding: '6px 8px', color: 'var(--txt)', fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace', width: '100%',
                textAlign: 'center', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => !set.completed && ((e.target as HTMLInputElement).style.borderColor = 'var(--violet)')}
              onMouseLeave={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border2)'}
            />

            {/* Reps input */}
            <input
              type="number"
              value={set.reps || ''}
              placeholder={prevBest ? `${prevBest.reps}` : '0'}
              disabled={set.completed}
              onChange={e => updateSet(exerciseIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
              onFocus={e => e.target.select()}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6,
                padding: '6px 8px', color: 'var(--txt)', fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace', width: '100%',
                textAlign: 'center', outline: 'none', transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => !set.completed && ((e.target as HTMLInputElement).style.borderColor = 'var(--violet)')}
              onMouseLeave={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border2)'}
            />

            {/* RPE selector */}
            <select
              value={set.rpe ?? ''}
              disabled={set.completed}
              onChange={e => updateSet(exerciseIdx, setIdx, 'rpe', parseInt(e.target.value))}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6,
                padding: '6px 4px', fontSize: 11, width: '100%', outline: 'none',
                color: set.rpe ? RPE_COLORS[set.rpe] : 'var(--txt3)',
                fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              <option value="">—</option>
              {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(r => (
                <option key={r} value={r} style={{ color: 'var(--txt)' }}>@{r}</option>
              ))}
            </select>

            {/* Complete checkbox */}
            <button
              onClick={() => toggleSetComplete(exerciseIdx, setIdx)}
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: set.completed ? 'var(--mint)' : 'var(--bg5)',
                border: `1.5px solid ${set.completed ? 'var(--mint)' : 'var(--border2)'}`,
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => !set.completed && ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--mint)')}
              onMouseLeave={e => !set.completed && ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)')}
            >
              {set.completed && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#09090f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          </div>
        ))}

        {/* Add set + note row */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 0 14px' }}>
          <button
            onClick={() => addSet(exerciseIdx)}
            style={{
              flex: 1, padding: '8px 0', background: 'var(--bg3)', border: '1px dashed var(--border2)',
              borderRadius: 8, color: 'var(--txt3)', fontSize: 12, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--violet)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--violet2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--txt3)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Add Set
          </button>
          <button
            onClick={() => setShowNote(v => !v)}
            style={{
              padding: '8px 14px', background: showNote ? 'rgba(124,92,252,0.1)' : 'var(--bg3)',
              border: `1px solid ${showNote ? 'var(--violet)' : 'var(--border2)'}`,
              borderRadius: 8, color: showNote ? 'var(--violet2)' : 'var(--txt3)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
            }}
          >
            📝 Note
          </button>
        </div>

        {/* Notes textarea */}
        {showNote && (
          <div style={{ paddingBottom: 14 }}>
            <textarea
              value={noteText}
              onChange={e => { setNoteText(e.target.value); addNote(exerciseIdx, e.target.value); }}
              placeholder="Add a note for this exercise..."
              rows={2}
              style={{
                width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)',
                borderRadius: 8, padding: '10px 12px', color: 'var(--txt)', fontSize: 12,
                fontFamily: 'DM Sans, sans-serif', resize: 'vertical', outline: 'none',
                lineHeight: 1.5,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
