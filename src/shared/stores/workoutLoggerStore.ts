import { create } from 'zustand';
import type { ExerciseLog, SetLog, PersonalRecord } from '../types';
import { saveWorkoutSession } from '../lib/db';
import { useAppStore } from './appStore';

// Get app store state directly
const getAppStore = () => useAppStore.getState();

export interface ActiveSession {
  id: string;
  name: string;
  startedAt: Date;
  exercises: ExerciseLog[];
  elapsedSeconds: number;
  restTimerSeconds: number | null;
  restTimerMax: number;
  newPRs: PersonalRecord[];
  showSummary: boolean;
}

interface WorkoutLoggerStore {
  session: ActiveSession | null;
  startSession: (name: string, exercises: ExerciseLog[]) => void;
  endSession: () => void;
  addSet: (exerciseIdx: number) => void;
  updateSet: (exerciseIdx: number, setIdx: number, field: keyof SetLog, value: number | boolean) => void;
  toggleSetComplete: (exerciseIdx: number, setIdx: number) => void;
  deleteSet: (exerciseIdx: number, setIdx: number) => void;
  addNote: (exerciseIdx: number, note: string) => void;
  tickTimer: () => void;
  startRestTimer: (seconds: number) => void;
  cancelRestTimer: () => void;
  tickRestTimer: () => void;
  dismissSummary: () => void;
  addNewPR: (pr: PersonalRecord) => void;
}

const makeDefaultSet = (setNumber: number): SetLog => ({
  setNumber,
  weight: 0,
  reps: 0,
  rpe: undefined,
  completed: false,
  isWarmup: false,
  timestamp: new Date(),
});

// Historical bests for PR detection (mock)
const HISTORICAL_BESTS: Record<string, { weight: number; reps: number }> = {
  'Flat Barbell Bench Press': { weight: 100, reps: 5 },
  'Back Squat':               { weight: 137.5, reps: 3 },
  'Deadlift':                 { weight: 172.5, reps: 3 },
  'Overhead Press':           { weight: 70, reps: 4 },
  'Incline DB Press':         { weight: 40, reps: 10 },
  'Barbell Rows':             { weight: 90, reps: 8 },
};

function calcOneRM(weight: number, reps: number) {
  return Math.round(weight * (1 + reps / 30));
}

function isPR(exerciseName: string, weight: number, reps: number): boolean {
  const best = HISTORICAL_BESTS[exerciseName];
  if (!best) return false;
  return calcOneRM(weight, reps) > calcOneRM(best.weight, best.reps);
}

export const useWorkoutLogger = create<WorkoutLoggerStore>((set, get) => ({
  session: null,

  startSession: (name, exercises) => set({
    session: {
      id: `session_${Date.now()}`,
      name,
      startedAt: new Date(),
      exercises,
      elapsedSeconds: 0,
      restTimerSeconds: null,
      restTimerMax: 90,
      newPRs: [],
      showSummary: false,
    }
  }),

  endSession: async () => {
    const s = get().session;
    const fu = getAppStore().firebaseUser;
    if (s && fu) {
      try {
        await saveWorkoutSession(fu.uid, {
          id: s.id,
          name: s.name,
          startedAt: s.startedAt,
          completedAt: new Date(),
          duration: s.elapsedSeconds,
          type: 'strength', // Simplified for now
          exercises: s.exercises,
          notes: '',
          mood: 3,
          totalVolume: s.exercises.reduce((v, ex) => v + ex.sets.reduce((sv, st) => sv + (st.completed ? st.weight * st.reps : 0), 0), 0),
          prsBreached: s.newPRs,
        });
      } catch (err) {
        console.error('Failed to save workout session', err);
      }
    }
    set(s => ({ session: s.session ? { ...s.session, showSummary: true } : null }));
  },

  dismissSummary: () => set({ session: null }),

  addSet: (exerciseIdx) => set(s => {
    if (!s.session) return s;
    const exercises = [...s.session.exercises];
    const ex = { ...exercises[exerciseIdx] };
    const prevSet = ex.sets[ex.sets.length - 1];
    ex.sets = [...ex.sets, makeDefaultSet(ex.sets.length + 1)];
    // Pre-fill weight/reps from previous set
    if (prevSet) {
      ex.sets[ex.sets.length - 1] = { ...ex.sets[ex.sets.length - 1], weight: prevSet.weight, reps: prevSet.reps };
    }
    exercises[exerciseIdx] = ex;
    return { session: { ...s.session, exercises } };
  }),

  updateSet: (exerciseIdx, setIdx, field, value) => set(s => {
    if (!s.session) return s;
    const exercises = [...s.session.exercises];
    const ex = { ...exercises[exerciseIdx] };
    const sets = [...ex.sets];
    sets[setIdx] = { ...sets[setIdx], [field]: value };
    ex.sets = sets;
    exercises[exerciseIdx] = ex;
    return { session: { ...s.session, exercises } };
  }),

  toggleSetComplete: (exerciseIdx, setIdx) => set(s => {
    if (!s.session) return s;
    const exercises = [...s.session.exercises];
    const ex = { ...exercises[exerciseIdx] };
    const sets = [...ex.sets];
    const set_ = { ...sets[setIdx], completed: !sets[setIdx].completed, timestamp: new Date() };
    sets[setIdx] = set_;
    ex.sets = sets;
    exercises[exerciseIdx] = ex;

    // PR detection
    let newPRs = [...s.session.newPRs];
    if (set_.completed && set_.weight > 0 && set_.reps > 0) {
      if (isPR(ex.exerciseName, set_.weight, set_.reps)) {
        const existing = newPRs.find(p => p.exerciseId === ex.exerciseId);
        if (!existing) {
          newPRs = [...newPRs, {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            weight: set_.weight,
            reps: set_.reps,
            estimatedOneRM: calcOneRM(set_.weight, set_.reps),
            achievedAt: new Date(),
          }];
        }
      }
    }

    // Auto-start rest timer on set completion
    const restTimerSeconds = set_.completed ? 90 : s.session.restTimerSeconds;
    return { session: { ...s.session, exercises, newPRs, restTimerSeconds } };
  }),

  deleteSet: (exerciseIdx, setIdx) => set(s => {
    if (!s.session) return s;
    const exercises = [...s.session.exercises];
    const ex = { ...exercises[exerciseIdx] };
    ex.sets = ex.sets.filter((_, i) => i !== setIdx).map((st, i) => ({ ...st, setNumber: i + 1 }));
    exercises[exerciseIdx] = ex;
    return { session: { ...s.session, exercises } };
  }),

  addNote: (exerciseIdx, note) => set(s => {
    if (!s.session) return s;
    const exercises = [...s.session.exercises];
    exercises[exerciseIdx] = { ...exercises[exerciseIdx], notes: note };
    return { session: { ...s.session, exercises } };
  }),

  tickTimer: () => set(s => {
    if (!s.session) return s;
    return { session: { ...s.session, elapsedSeconds: s.session.elapsedSeconds + 1 } };
  }),

  startRestTimer: (seconds) => set(s => ({
    session: s.session ? { ...s.session, restTimerSeconds: seconds, restTimerMax: seconds } : null
  })),

  cancelRestTimer: () => set(s => ({
    session: s.session ? { ...s.session, restTimerSeconds: null } : null
  })),

  tickRestTimer: () => set(s => {
    if (!s.session || s.session.restTimerSeconds === null) return s;
    const next = s.session.restTimerSeconds - 1;
    return { session: { ...s.session, restTimerSeconds: next <= 0 ? null : next } };
  }),

  addNewPR: (pr) => set(s => ({
    session: s.session ? { ...s.session, newPRs: [...s.session.newPRs, pr] } : null
  })),
}));
