import { create } from 'zustand';
import type { Signal } from '@/types';

interface SignalState {
  signal: Signal | null;
  history: Signal[];
  setSignal: (signal: Signal | null) => void;
}

export const useSignalStore = create<SignalState>((set) => ({
  signal: null,
  history: [],

  setSignal: (signal) =>
    set((state) => ({
      signal,
      history: signal
        ? [signal, ...state.history].slice(0, 50) // Keep last 50 signals
        : state.history,
    })),
}));
