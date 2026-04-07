import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Candle, Timeframe } from '@/types';
import { appendCandle } from '@/utils/candles';

interface ChartState {
  symbol: string;
  timeframe: Timeframe;
  candles: Candle[];
  isLoading: boolean;
  error: string | null;
  setSymbol: (symbol: string) => void;
  setTimeframe: (tf: Timeframe) => void;
  setCandles: (candles: Candle[]) => void;
  appendCandle: (candle: Candle) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChartStore = create<ChartState>()(
  subscribeWithSelector((set) => ({
    symbol: 'BTCUSDT',
    timeframe: '1m',
    candles: [],
    isLoading: false,
    error: null,

    setSymbol: (symbol) => set({ symbol }),
    setTimeframe: (timeframe) => set({ timeframe }),
    setCandles: (candles) => set({ candles }),
    appendCandle: (candle) =>
      set((state) => ({ candles: appendCandle(state.candles, candle) })),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
  }))
);
