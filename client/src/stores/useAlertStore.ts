import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Alert } from '@/types';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  markAllRead: () => void;
  clearAlerts: () => void;
  setAlerts: (alerts: Alert[]) => void;
}

export const useAlertStore = create<AlertState>()(
  subscribeWithSelector((set) => ({
    alerts: [],
    unreadCount: 0,

    addAlert: (alert) =>
      set((state) => ({
        alerts: [alert, ...state.alerts].slice(0, 50),
        unreadCount: state.unreadCount + 1,
      })),

    markAllRead: () =>
      set((state) => ({
        alerts: state.alerts.map((a) => ({ ...a, read: true })),
        unreadCount: 0,
      })),

    clearAlerts: () => set({ alerts: [], unreadCount: 0 }),

    setAlerts: (alerts) =>
      set({
        alerts,
        unreadCount: alerts.filter((a) => !a.read).length,
      }),
  }))
);
