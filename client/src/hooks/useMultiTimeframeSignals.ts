import { useState, useEffect, useRef } from 'react';
import { useChartStore } from '@/stores/useChartStore';
import { fetchKlines } from '@/services/api/binanceRest';
import { calculateAllIndicators } from '@/services/indicators/calculator';
import { detectSRLevels } from '@/engine/supportResistance';
import { generateSignal } from '@/engine/signalEngine';
import type { Signal } from '@/types';

const MTF_TIMEFRAMES = ['15m', '1h', '4h', '1d'] as const;
export type MTFTimeframe = typeof MTF_TIMEFRAMES[number];

interface CacheEntry {
  signals: Record<MTFTimeframe, Signal | null>;
  timestamp: number;
}

// Module-level cache: key = symbol, TTL = 60s
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60_000;

interface MTFState {
  signals: Record<MTFTimeframe, Signal | null>;
  loading: boolean;
  timeframes: readonly MTFTimeframe[];
}

export function useMultiTimeframeSignals(): MTFState {
  const symbol = useChartStore((s) => s.symbol);
  const [state, setState] = useState<MTFState>({
    signals: { '15m': null, '1h': null, '4h': null, '1d': null },
    loading: true,
    timeframes: MTF_TIMEFRAMES,
  });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!symbol) return;

    // Check cache
    const cached = cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setState({ signals: cached.signals, loading: false, timeframes: MTF_TIMEFRAMES });
      return;
    }

    // Cancel any in-flight fetches
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true }));

    const fetchForTf = async (tf: MTFTimeframe): Promise<Signal | null> => {
      try {
        const candles = await fetchKlines(symbol, tf, 200);
        if (!candles.length) return null;
        const indicators = calculateAllIndicators(candles);
        const srLevels = detectSRLevels(candles);
        return generateSignal(candles, indicators, srLevels);
      } catch {
        return null;
      }
    };

    Promise.allSettled(MTF_TIMEFRAMES.map((tf) => fetchForTf(tf))).then((results) => {
      const signals = {} as Record<MTFTimeframe, Signal | null>;
      MTF_TIMEFRAMES.forEach((tf, i) => {
        const result = results[i];
        signals[tf] = result.status === 'fulfilled' ? result.value : null;
      });

      cache.set(symbol, { signals, timestamp: Date.now() });
      setState({ signals, loading: false, timeframes: MTF_TIMEFRAMES });
    });

    return () => {
      abortRef.current?.abort();
    };
  }, [symbol]);

  return state;
}
