import { useState, useMemo } from 'react';
import { useAppStore } from '../../shared/stores/appStore';
import { useWorkoutLogger } from '../../shared/stores/workoutLoggerStore';
import { EXERCISES, MUSCLE_GROUPS, EQUIPMENT_TYPES, DIFFICULTY_LEVELS } from '../../shared/lib/exerciseData';
import type { MuscleGroup } from '../../shared/types';
import { Search, Plus, Filter, X } from 'lucide-react';

export default function WorkoutLibrary() {
  const { setActiveTab } = useAppStore();
  const { session, startSession } = useWorkoutLogger();
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string | 'all'>('all');
  const [filterEquipment, setFilterEquipment] = useState<string | 'all'>('all');

  const filteredExercises = useMemo(() => {
    return EXERCISES.filter(ex => {
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterMuscle !== 'all' && !ex.muscleGroups.includes(filterMuscle)) return false;
      if (filterDifficulty !== 'all' && ex.difficulty !== filterDifficulty) return false;
      if (filterEquipment !== 'all' && ex.equipment !== filterEquipment) return false;
      return true;
    });
  }, [search, filterMuscle, filterDifficulty, filterEquipment]);

  const handleAddToLog = (ex: typeof EXERCISES[0]) => {
    if (!session) {
      startSession('Custom Workout', [{
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: [{ setNumber: 1, weight: 0, reps: 0, completed: false, isWarmup: false, timestamp: new Date() }],
        notes: '',
        order: 0,
      }]);
    } else {
      // Access the inner array directly; update via store method if needed but easier here
      // WorkoutLoggerStore handles it, but since we only have startSession/addSet and not addExercise...
      // wait, workoutLoggerStore doesn't have an `addExercise` action out of the box...
      // Let's add it via a hack on startSession or just call something we'll add? Let's use startSession if no session, else we might need to add addExercise.
      // Wait, we can implement addExercise in the store via useWorkoutLogger.getState()... actually we'll just implement it now.
      useWorkoutLogger.setState(s => {
        if (!s.session) return s;
        return {
          session: {
            ...s.session,
            exercises: [...s.session.exercises, {
              exerciseId: ex.id,
              exerciseName: ex.name,
              sets: [{ setNumber: 1, weight: 0, reps: 0, completed: false, isWarmup: false, timestamp: new Date() }],
              notes: '',
              order: s.session.exercises.length,
            }]
          }
        };
      });
    }
    setActiveTab('log');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header and Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
        <div style={{ flex: 1, maxWidth: 600 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--txt)', margin: '0 0 16px' }}>Exercise Library</h1>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--txt3)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search 80+ exercises..."
              style={{ width: '100%', border: 'none', background: 'var(--bg3)', borderRadius: 12, padding: '16px 16px 16px 44px', color: 'var(--txt)', fontSize: 15, fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 8 }}><Filter size={14} color="var(--txt3)"/> <span style={{fontSize: 12, color: 'var(--txt3)', fontWeight: 600}}>FILTERS</span></div>
        <select value={filterMuscle} onChange={e => setFilterMuscle(e.target.value as any)} style={{ background: filterMuscle !== 'all' ? 'var(--violet)' : 'var(--bg3)', color: filterMuscle !== 'all' ? '#fff' : 'var(--txt)', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Muscles</option>
          {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
        </select>
        <select value={filterEquipment} onChange={e => setFilterEquipment(e.target.value)} style={{ background: filterEquipment !== 'all' ? 'var(--violet)' : 'var(--bg3)', color: filterEquipment !== 'all' ? '#fff' : 'var(--txt)', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Equipment</option>
          {EQUIPMENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)} style={{ background: filterDifficulty !== 'all' ? 'var(--violet)' : 'var(--bg3)', color: filterDifficulty !== 'all' ? '#fff' : 'var(--txt)', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Difficulties</option>
          {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
        
        {(filterMuscle !== 'all' || filterEquipment !== 'all' || filterDifficulty !== 'all' || search) && (
          <button onClick={() => { setSearch(''); setFilterMuscle('all'); setFilterEquipment('all'); setFilterDifficulty('all'); }} style={{ background: 'transparent', border: 'none', color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
            <X size={14}/> Clear
          </button>
        )}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filteredExercises.map(ex => (
          <div key={ex.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s' }}
               onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'}
               onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--txt)' }}>{ex.name}</div>
              <button 
                onClick={() => handleAddToLog(ex)}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(0,229,160,0.1)', color: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                title="Add to Workout"
              >
                <Plus size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {ex.muscleGroups.slice(0, 2).map((m, i) => (
                <span key={m} style={{ padding: '4px 10px', borderRadius: 6, background: i === 0 ? 'rgba(124,92,252,0.1)' : 'var(--bg3)', color: i === 0 ? 'var(--violet2)' : 'var(--txt2)', fontSize: 11, fontWeight: 600 }}>
                  {m.toUpperCase()}
                </span>
              ))}
              <span style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--bg3)', color: 'var(--txt2)', fontSize: 11, fontWeight: 600 }}>{ex.equipment}</span>
            </div>

            <div style={{ flex: 1 }}>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--txt3)', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ex.instructions.slice(0, 2).map((ins, i) => <li key={i}>{ins}</li>)}
              </ul>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: ex.difficulty === 'beginner' ? 'var(--mint)' : ex.difficulty === 'intermediate' ? 'var(--gold)' : 'var(--red)' }} />
                <span style={{ fontSize: 12, color: 'var(--txt2)', textTransform: 'capitalize' }}>{ex.difficulty}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: 'JetBrains Mono, monospace' }}>{ex.mechanic}</span>
            </div>
          </div>
        ))}
        {filteredExercises.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'var(--txt3)' }}>
            No exercises match your filters.
          </div>
        )}
      </div>

    </div>
  );
}
