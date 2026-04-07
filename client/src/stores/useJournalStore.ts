import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Trade } from '@/types';

interface JournalState {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'openedAt' | 'status'>) => void;
  closeTrade: (id: string, closePrice: number) => void;
  cancelTrade: (id: string) => void;
  clearAll: () => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    subscribeWithSelector((set) => ({
      trades: [],

      addTrade: (trade) =>
        set((state) => ({
          trades: [
            {
              ...trade,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              openedAt: Date.now(),
              status: 'open',
            },
            ...state.trades,
          ],
        })),

      closeTrade: (id, closePrice) =>
        set((state) => ({
          trades: state.trades.map((t) => {
            if (t.id !== id || t.status !== 'open') return t;
            const pnl =
              t.side === 'long'
                ? (closePrice - t.entry) * t.qty
                : (t.entry - closePrice) * t.qty;
            return {
              ...t,
              status: 'closed',
              closedAt: Date.now(),
              closePrice,
              pnl,
            };
          }),
        })),

      cancelTrade: (id) =>
        set((state) => ({
          trades: state.trades.map((t) =>
            t.id === id && t.status === 'open' ? { ...t, status: 'cancelled' } : t
          ),
        })),

      clearAll: () => set({ trades: [] }),
    })),
    { name: 'quantix-journal' }
  )
);
