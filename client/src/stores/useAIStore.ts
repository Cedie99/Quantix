import { create } from 'zustand';
import type { AIAnalysis } from '@/types';

interface AIState {
  analysis: AIAnalysis | null;
  isLoading: boolean;
  error: string | null;
  setAnalysis: (a: AIAnalysis | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useAIStore = create<AIState>((set) => ({
  analysis: null,
  isLoading: false,
  error: null,
  setAnalysis: (analysis) => set({ analysis }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
