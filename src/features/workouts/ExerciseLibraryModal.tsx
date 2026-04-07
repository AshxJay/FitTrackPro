import { useState } from 'react';
import { EXERCISE_LIBRARY, type ExerciseDef, type MuscleGroup } from '../../shared/lib/exercises';
import VideoPlayer from './VideoPlayer';

interface ExerciseLibraryModalProps {
  onClose: () => void;
  onSelectExercise?: (ex: ExerciseDef) => void;
}

const MUSCLES: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'];

export default function ExerciseLibraryModal({ onClose, onSelectExercise }: ExerciseLibraryModalProps) {
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | 'All'>('All');
  const [playingVideo, setPlayingVideo] = useState<ExerciseDef | null>(null);

  const filtered = EXERCISE_LIBRARY.filter(ex => {
    if (filterMuscle !== 'All' && ex.muscleGroup !== filterMuscle) return false;
    if (search) {
      const q = search.toLowerCase();
      return ex.name.toLowerCase().includes(q) || ex.equipment.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', animation: 'fadeIn 0.2s ease' }} onClick={onClose}>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 900, height: '100%', maxHeight: 800, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'var(--card)' }}>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--txt)' }}>Exercise Library</div>
              <div style={{ fontSize: 13, color: 'var(--txt3)', marginTop: 4 }}>{EXERCISE_LIBRARY.length} curated movements with video demonstrations</div>
            </div>
            <button
              onClick={onClose}
              style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--txt2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,59,92,0.1)'; e.currentTarget.style.color = 'var(--red)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--txt2)'; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Toolbar */}
          <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0, background: 'var(--bg)' }}>
            <input
              autoFocus
              placeholder="Search exercise or equipment..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: '12px 18px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--txt)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              <button
                onClick={() => setFilterMuscle('All')}
                style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${filterMuscle === 'All' ? 'var(--violet)' : 'var(--border)'}`, background: filterMuscle === 'All' ? 'rgba(124,92,252,0.15)' : 'var(--card)', color: filterMuscle === 'All' ? 'var(--violet2)' : 'var(--txt2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                All
              </button>
              {MUSCLES.map(m => (
                <button
                  key={m}
                  onClick={() => setFilterMuscle(m)}
                  style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${filterMuscle === m ? 'var(--violet)' : 'var(--border)'}`, background: filterMuscle === m ? 'rgba(124,92,252,0.15)' : 'var(--card)', color: filterMuscle === m ? 'var(--violet2)' : 'var(--txt2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, alignContent: 'start', background: 'var(--bg)' }}>
            {filtered.map(ex => (
              <div key={ex.id} style={{ padding: '16px', borderRadius: 16, background: 'var(--card)', border: '1px solid var(--border)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--violet)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--txt)', marginBottom: 8, lineHeight: 1.2 }}>
                  {ex.name}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(124,92,252,0.15)', color: 'var(--violet2)' }}>{ex.muscleGroup}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--txt3)' }}>{ex.equipment}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => setPlayingVideo(ex)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 10, border: '1px solid rgba(0,229,160,0.2)', background: 'rgba(0,229,160,0.05)', color: 'var(--mint)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,160,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,229,160,0.05)'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Watch Form
                  </button>
                  {onSelectExercise && (
                    <button
                      onClick={() => { onSelectExercise(ex); onClose(); }}
                      style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: 'var(--violet)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Add to Session
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--txt3)', fontSize: 15 }}>
                No exercises found matching "{search}".
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global PiP Player */}
      {playingVideo && (
        <VideoPlayer
          ytId={playingVideo.ytId}
          title={playingVideo.name}
          onClose={() => setPlayingVideo(null)}
        />
      )}
    </>
  );
}
