import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, orderBy, limit,
  onSnapshot, serverTimestamp, type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, WorkoutSession } from '../types';

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    ...d,
    id: uid,
    joinedAt: d.joinedAt?.toDate?.() ?? new Date(),
  } as User;
}

export async function createUserProfile(uid: string, data: Partial<User>): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    joinedAt: serverTimestamp(),
    subscription: 'free',
    streak: 0,
  }, { merge: true });
}

export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data as Record<string, unknown>);
}

// ─── Workout Sessions ─────────────────────────────────────────────────────────

export async function saveWorkoutSession(uid: string, session: Omit<WorkoutSession, 'userId'>): Promise<void> {
  const col = collection(db, 'workouts', uid, 'sessions');
  await addDoc(col, {
    ...session,
    userId: uid,
    startedAt: session.startedAt instanceof Date ? session.startedAt : new Date(session.startedAt),
    completedAt: session.completedAt instanceof Date ? session.completedAt : new Date(),
    savedAt: serverTimestamp(),
  });
}

export async function getWorkoutHistory(uid: string): Promise<WorkoutSession[]> {
  const col = collection(db, 'workouts', uid, 'sessions');
  const q = query(col, orderBy('completedAt', 'desc'), limit(30));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      userId: uid,
      startedAt: data.startedAt?.toDate?.() ?? new Date(),
      completedAt: data.completedAt?.toDate?.() ?? new Date(),
    } as WorkoutSession;
  });
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

export type NutritionDay = {
  calories:  { consumed: number; target: number };
  protein:   { consumed: number; target: number };
  carbs:     { consumed: number; target: number };
  fat:       { consumed: number; target: number };
  water:     number; // cups
};

export const DEFAULT_NUTRITION: NutritionDay = {
  calories: { consumed: 0, target: 2000 },
  protein:  { consumed: 0, target: 200 },
  carbs:    { consumed: 0, target: 280 },
  fat:      { consumed: 0, target: 70 },
  water:    0,
};

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function subscribeToTodayNutrition(
  uid: string,
  cb: (data: NutritionDay) => void,
): Unsubscribe {
  const ref = doc(db, 'nutrition', uid, 'days', todayKey());
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      cb(snap.data() as NutritionDay);
    } else {
      // Auto-create today's entry
      setDoc(ref, DEFAULT_NUTRITION).catch(console.error);
      cb(DEFAULT_NUTRITION);
    }
  });
}

export async function updateWaterIntake(uid: string, cups: number): Promise<void> {
  const ref = doc(db, 'nutrition', uid, 'days', todayKey());
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...DEFAULT_NUTRITION, water: Math.max(0, Math.min(8, cups)) });
  } else {
    await updateDoc(ref, { water: Math.max(0, Math.min(8, cups)) });
  }
}

export async function updateNutritionMacros(
  uid: string,
  data: Partial<NutritionDay>,
): Promise<void> {
  const ref = doc(db, 'nutrition', uid, 'days', todayKey());
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...DEFAULT_NUTRITION, ...data });
  } else {
    await updateDoc(ref, data as Record<string, unknown>);
  }
}
