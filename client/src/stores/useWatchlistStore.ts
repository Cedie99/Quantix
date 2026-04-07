import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { WatchlistItem } from '@/types';
import { DEFAULT_WATCHLIST } from '@/constants';

interface WatchlistState {
  items: WatchlistItem[];
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  updatePrice: (symbol: string, price: number, change24h: number) => void;
  setItems: (symbols: string[]) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  subscribeWithSelector((set) => ({
    items: DEFAULT_WATCHLIST.map((symbol) => ({ symbol })),

    addSymbol: (symbol) =>
      set((state) => {
        if (state.items.some((i) => i.symbol === symbol)) return state;
        return { items: [...state.items, { symbol }] };
      }),

    removeSymbol: (symbol) =>
      set((state) => ({ items: state.items.filter((i) => i.symbol !== symbol) })),

    updatePrice: (symbol, price, change24h) =>
      set((state) => ({
        items: state.items.map((item) =>
          item.symbol === symbol ? { ...item, price, change24h } : item
        ),
      })),

    setItems: (symbols) =>
      set({ items: symbols.map((symbol) => ({ symbol })) }),
  }))
);
