import { create } from 'zustand';
import type { IndicatorSet } from '@/types';

interface IndicatorState {
  indicators: IndicatorSet | null;
  setIndicators: (indicators: IndicatorSet | null) => void;
}

export const useIndicatorStore = create<IndicatorState>((set) => ({
  indicators: null,
  setIndicators: (indicators) => set({ indicators }),
}));
