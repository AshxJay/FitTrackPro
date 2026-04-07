import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, orderBy, limit,
  onSnapshot, serverTimestamp, arrayUnion, arrayRemove,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, WorkoutSession, BodyMetric } from '../types';

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

// ─── Workout History (Real-time) ─────────────────────────────────────────────

export function subscribeToWorkoutHistory(
  uid: string,
  cb: (sessions: WorkoutSession[]) => void,
  count = 30,
): Unsubscribe {
  const col = collection(db, 'workouts', uid, 'sessions');
  const q = query(col, orderBy('completedAt', 'desc'), limit(count));
  return onSnapshot(q, (snap) => {
    const sessions: WorkoutSession[] = snap.docs.map(d => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        userId: uid,
        startedAt: data.startedAt?.toDate?.() ?? new Date(),
        completedAt: data.completedAt?.toDate?.() ?? new Date(),
      } as WorkoutSession;
    });
    cb(sessions);
  });
}

// ─── Body Metrics ─────────────────────────────────────────────────────────────

export async function saveBodyMetric(
  uid: string,
  metric: Omit<BodyMetric, never>,
): Promise<void> {
  const col = collection(db, 'bodyMetrics', uid, 'entries');
  await addDoc(col, { ...metric, loggedAt: serverTimestamp() });
}

export async function getBodyMetrics(uid: string): Promise<BodyMetric[]> {
  const col = collection(db, 'bodyMetrics', uid, 'entries');
  const q = query(col, orderBy('loggedAt', 'desc'), limit(52)); // ~1 year weekly
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    ...d.data(),
    id: d.id,
  } as BodyMetric & { id: string }));
}

export function subscribeToBodyMetrics(
  uid: string,
  cb: (metrics: (BodyMetric & { id: string })[]) => void,
): Unsubscribe {
  const col = collection(db, 'bodyMetrics', uid, 'entries');
  const q = query(col, orderBy('loggedAt', 'desc'), limit(52));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ ...d.data(), id: d.id } as BodyMetric & { id: string })));
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

export async function getNutritionDay(
  uid: string,
  dateKey: string,
): Promise<NutritionDay | null> {
  const ref = doc(db, 'nutrition', uid, 'days', dateKey);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as NutritionDay) : null;
}

// ─── Community Posts ──────────────────────────────────────────────────────────

export interface CommunityPost {
  id?: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  content: string;
  type: 'workout' | 'pr' | 'streak' | 'update';
  meta?: { exercise?: string; weight?: number; reps?: number; streak?: number };
  likes: number;
  likedBy: string[];
  comments: number;
  createdAt: Date | null;
}

export async function createPost(
  post: Omit<CommunityPost, 'id' | 'likes' | 'likedBy' | 'comments' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'communityPosts'), {
    ...post,
    likes: 0,
    likedBy: [],
    comments: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function togglePostLike(postId: string, uid: string, currentlyLiked: boolean): Promise<void> {
  const ref = doc(db, 'communityPosts', postId);
  await updateDoc(ref, {
    likedBy: currentlyLiked ? arrayRemove(uid) : arrayUnion(uid),
    likes: currentlyLiked ? (await getDoc(ref)).data()!.likes - 1 : (await getDoc(ref)).data()!.likes + 1,
  });
}

export function subscribeToFeed(
  cb: (posts: CommunityPost[]) => void,
  count = 30,
): Unsubscribe {
  const q = query(
    collection(db, 'communityPosts'),
    orderBy('createdAt', 'desc'),
    limit(count),
  );
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({
      ...d.data(),
      id: d.id,
      createdAt: d.data().createdAt?.toDate?.() ?? null,
    } as CommunityPost)));
  });
}

// ─── AI Chat History ──────────────────────────────────────────────────────────

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date | null;
}

export async function saveAIMessage(
  uid: string,
  msg: Omit<ChatMessage, 'id' | 'createdAt'>,
): Promise<void> {
  await addDoc(collection(db, 'aiChats', uid, 'messages'), {
    ...msg,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToAIChat(
  uid: string,
  cb: (messages: ChatMessage[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'aiChats', uid, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(40),
  );
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({
      ...d.data(),
      id: d.id,
      createdAt: d.data().createdAt?.toDate?.() ?? null,
    } as ChatMessage)));
  });
}

export async function clearAIChat(uid: string): Promise<void> {
  const q = query(collection(db, 'aiChats', uid, 'messages'), limit(100));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map(d => import('firebase/firestore').then(({ deleteDoc }) => deleteDoc(d.ref))));
}
