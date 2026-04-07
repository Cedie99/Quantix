import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import type { PriceAlert } from '@/types';

interface PriceAlertState {
  priceAlerts: PriceAlert[];
  addPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'active'>) => void;
  removePriceAlert: (id: string) => void;
  triggerPriceAlert: (id: string, triggeredAt: number) => void;
  clearTriggered: () => void;
}

export const usePriceAlertStore = create<PriceAlertState>()(
  persist(
    subscribeWithSelector((set) => ({
      priceAlerts: [],

      addPriceAlert: (alert) =>
        set((state) => ({
          priceAlerts: [
            {
              ...alert,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdAt: Date.now(),
              active: true,
            },
            ...state.priceAlerts,
          ],
        })),

      removePriceAlert: (id) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.filter((a) => a.id !== id),
        })),

      triggerPriceAlert: (id, triggeredAt) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.map((a) =>
            a.id === id ? { ...a, active: false, triggeredAt } : a
          ),
        })),

      clearTriggered: () =>
        set((state) => ({
          priceAlerts: state.priceAlerts.filter((a) => a.active),
        })),
    })),
    { name: 'quantix-price-alerts' }
  )
);
