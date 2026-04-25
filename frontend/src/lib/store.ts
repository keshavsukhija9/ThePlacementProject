import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

export interface ScheduleItem {
  id: string;
  day_index: number;
  time_slot: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  resource_url: string;
  status: 'pending' | 'completed' | 'skipped';
}

export interface Schedule {
  schedule_id: string;
  items: ScheduleItem[];
  next_sync_at: string;
}

export interface Profile {
  user_id: string;
  college_tier: string | null;
  branch: string | null;
  grad_year: number | null;
  target_roles: string[];
  weekday_hrs: number | null;
  weekend_hrs: number | null;
  preferred_windows: string[];
  skill_levels: Record<string, string> | null;
  is_pro: boolean;
  pro_expires_at: string | null;
  telegram_chat_id: string | null;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppStore {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Profile
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;

  // Schedule
  schedule: Schedule | null;
  setSchedule: (schedule: Schedule | null) => void;
  updateItemStatus: (itemId: string, status: ScheduleItem['status']) => void;

  // Progress
  streak: number;
  readinessScore: number;
  setStreak: (streak: number) => void;
  setReadinessScore: (score: number) => void;

  // Toast
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // Auth
  user: null,
  setUser: (user) => set({ user }),

  // Profile
  profile: null,
  setProfile: (profile) => set({ profile }),

  // Schedule
  schedule: null,
  setSchedule: (schedule) => set({ schedule }),
  updateItemStatus: (itemId, status) => {
    const schedule = get().schedule;
    if (!schedule) return;
    set({
      schedule: {
        ...schedule,
        items: schedule.items.map((item) =>
          item.id === itemId ? { ...item, status } : item
        ),
      },
    });
  },

  // Progress
  streak: 0,
  readinessScore: 0,
  setStreak: (streak) => set({ streak }),
  setReadinessScore: (readinessScore) => set({ readinessScore }),

  // Toast
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
