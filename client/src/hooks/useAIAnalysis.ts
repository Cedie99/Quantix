import { useEffect, useRef } from 'react';
import { useChartStore } from '@/stores/useChartStore';
import { useSignalStore } from '@/stores/useSignalStore';
import { useAIStore } from '@/stores/useAIStore';
import { fetchAIAnalysis } from '@/services/api/aiAnalysis';
import type { Signal } from '@/types';

export function useAIAnalysis() {
  const { signal } = useSignalStore();
  const { symbol, timeframe, candles } = useChartStore();
  const { setAnalysis, setLoading, setError } = useAIStore();
  const prevTypeRef = useRef<string | null>(null);

  const run = async (s: Signal | null) => {
    if (!s || candles.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const price = candles[candles.length - 1].close;
      const result = await fetchAIAnalysis(symbol, timeframe, price, s);
      setAnalysis({ ...result, timestamp: Date.now() });
    } catch {
      setError('AI analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger when signal type changes
  useEffect(() => {
    if (!signal) return;
    if (signal.type === prevTypeRef.current) return;
    prevTypeRef.current = signal.type;
    run(signal);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal?.type]);

  return { refresh: () => run(signal) };
}
