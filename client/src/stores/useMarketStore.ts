import { create } from 'zustand';
import type { MarketOverview, TopMovers } from '@/types';

interface MarketState {
  overview: MarketOverview | null;
  movers: TopMovers | null;
  isLoading: boolean;
  setOverview: (overview: MarketOverview | null) => void;
  setMovers: (movers: TopMovers | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  overview: null,
  movers: null,
  isLoading: false,
  setOverview: (overview) => set({ overview }),
  setMovers: (movers) => set({ movers }),
  setLoading: (isLoading) => set({ isLoading }),
}));
