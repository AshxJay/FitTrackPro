import { create } from 'zustand';
import { mockUser, weeklyStats, todayNutrition } from '../lib/mockData';
import type { User } from '../types';

interface AppStore {
  user: User;
  activeTab: string;
  sidebarExpanded: boolean;
  commandPaletteOpen: boolean;
  weeklyStats: typeof weeklyStats;
  todayNutrition: typeof todayNutrition;
  isAuthenticated: boolean;
  setActiveTab: (tab: string) => void;
  setSidebarExpanded: (v: boolean) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  incrementWater: () => void;
  setAuthenticated: (v: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: mockUser,
  activeTab: 'dashboard',
  sidebarExpanded: false,
  commandPaletteOpen: false,
  weeklyStats,
  todayNutrition,
  isAuthenticated: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
  incrementWater: () =>
    set((s) => ({
      todayNutrition: {
        ...s.todayNutrition,
        water: Math.min(s.todayNutrition.water + 1, 8),
      },
    })),
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  logout: () => set({ isAuthenticated: false, activeTab: 'dashboard' }),
}));
