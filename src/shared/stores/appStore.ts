import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  getUserProfile, createUserProfile,
  subscribeToTodayNutrition, updateWaterIntake,
  type NutritionDay, DEFAULT_NUTRITION,
} from '../lib/db';
import { weeklyStats } from '../lib/mockData';
import type { User } from '../types';

interface AuthError { message: string }

interface AppStore {
  // State
  user: User | null;
  firebaseUser: FirebaseUser | null;
  activeTab: string;
  sidebarExpanded: boolean;
  commandPaletteOpen: boolean;
  weeklyStats: typeof weeklyStats;
  todayNutrition: NutritionDay;
  isAuthenticated: boolean;
  authLoading: boolean;   // true while Firebase resolves the session
  authError: string | null;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;

  // App actions
  setActiveTab: (tab: string) => void;
  setSidebarExpanded: (v: boolean) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  incrementWater: () => Promise<void>;
  setUser: (user: User | null) => void;
  setFirebaseUser: (u: FirebaseUser | null) => void;
  setTodayNutrition: (n: NutritionDay) => void;
  setAuthLoading: (v: boolean) => void;
}

// Unsubscribe handle for the Firestore nutrition listener
let nutritionUnsub: (() => void) | null = null;

function mapFirebaseUserToUser(fu: FirebaseUser): User {
  return {
    id: fu.uid,
    email: fu.email ?? '',
    username: fu.displayName?.toLowerCase().replace(/\s+/g, '') ?? fu.uid.slice(0, 8),
    displayName: fu.displayName ?? 'Athlete',
    avatarUrl: fu.photoURL ?? undefined,
    stats: { height: 175, weight: 75, age: 25, gender: 'unknown' },
    goals: ['general'],
    experienceLevel: 'intermediate',
    equipment: ['full_gym'],
    units: 'metric',
    subscription: 'free',
    streak: 0,
    joinedAt: new Date(),
  };
}

export const useAppStore = create<AppStore>((set, get) => ({
  // ── Initial state ─────────────────────────────────────────
  user: null,
  firebaseUser: null,
  activeTab: 'dashboard',
  sidebarExpanded: false,
  commandPaletteOpen: false,
  weeklyStats,
  todayNutrition: DEFAULT_NUTRITION,
  isAuthenticated: false,
  authLoading: true,
  authError: null,

  // ── Auth actions ──────────────────────────────────────────
  login: async (email, password) => {
    set({ authError: null, authLoading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest
    } catch (err) {
      const e = err as AuthError;
      let msg = 'Login failed. Please try again.';
      if (e.message.includes('user-not-found') || e.message.includes('invalid-credential')) msg = 'No account found with that email.';
      else if (e.message.includes('wrong-password')) msg = 'Incorrect password.';
      else if (e.message.includes('too-many-requests')) msg = 'Too many attempts. Try again later.';
      set({ authError: msg, authLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    set({ authError: null, authLoading: true });
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google sign-in error:', err);
      const e = err as AuthError;
      if (!e.message.includes('popup-closed')) {
        set({ authError: `Google sign-in failed: ${e.message}` });
      }
      set({ authLoading: false });
      throw err;
    }
  },

  signup: async (name, email, password) => {
    set({ authError: null, authLoading: true });
    try {
      const { user: fu } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(fu, { displayName: name });
      // Create Firestore profile
      await createUserProfile(fu.uid, {
        displayName: name,
        email: fu.email ?? email,
        username: name.toLowerCase().replace(/\s+/g, ''),
        stats: { height: 175, weight: 75, age: 25, gender: 'unknown' },
        goals: ['general'],
        experienceLevel: 'intermediate',
        equipment: ['full_gym'],
        units: 'metric',
        subscription: 'free',
        streak: 0,
      });
    } catch (err) {
      const e = err as AuthError;
      let msg = 'Sign-up failed. Please try again.';
      if (e.message.includes('email-already-in-use')) msg = 'An account with this email already exists.';
      else if (e.message.includes('invalid-email')) msg = 'That email address is not valid.';
      else if (e.message.includes('weak-password')) msg = 'Password is too weak. Use at least 6 characters.';
      set({ authError: msg, authLoading: false });
      throw err;
    }
  },

  logout: async () => {
    nutritionUnsub?.();
    nutritionUnsub = null;
    await signOut(auth);
    set({
      isAuthenticated: false,
      user: null,
      firebaseUser: null,
      activeTab: 'dashboard',
      todayNutrition: DEFAULT_NUTRITION,
    });
  },

  clearAuthError: () => set({ authError: null }),

  // ── App actions ───────────────────────────────────────────
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),

  incrementWater: async () => {
    const { todayNutrition, firebaseUser } = get();
    const next = Math.min(todayNutrition.water + 1, 8);
    set(s => ({ todayNutrition: { ...s.todayNutrition, water: next } }));
    if (firebaseUser) {
      await updateWaterIntake(firebaseUser.uid, next);
    }
  },

  setUser: (user) => set({ user }),
  setFirebaseUser: (u) => set({ firebaseUser: u }),
  setTodayNutrition: (n) => set({ todayNutrition: n }),
  setAuthLoading: (v) => set({ authLoading: v }),
}));

// ── Firebase Auth Listener (singleton, runs once on module load) ─────────────
onAuthStateChanged(auth, async (firebaseUser) => {
  const { setUser, setFirebaseUser, setTodayNutrition } = useAppStore.getState();

  if (firebaseUser) {
    // Fetch or build user profile
    let profile = await getUserProfile(firebaseUser.uid);
    if (!profile) {
      profile = mapFirebaseUserToUser(firebaseUser);
      await createUserProfile(firebaseUser.uid, profile);
    }

    // Subscribe to today's nutrition
    nutritionUnsub?.();
    nutritionUnsub = subscribeToTodayNutrition(firebaseUser.uid, (data) => {
      setTodayNutrition(data);
    });

    useAppStore.setState({
      firebaseUser,
      user: profile,
      isAuthenticated: true,
      authLoading: false,
      authError: null,
    });
  } else {
    nutritionUnsub?.();
    nutritionUnsub = null;
    setFirebaseUser(null);
    setUser(null);
    useAppStore.setState({ isAuthenticated: false, authLoading: false });
  }
});
