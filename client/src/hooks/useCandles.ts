import { useEffect } from 'react';
import { useChartStore } from '@/stores/useChartStore';
import { fetchKlines } from '@/services/api/binanceRest';

export function useCandles() {
  const { symbol, timeframe, setCandles, setLoading, setError } = useChartStore();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchKlines(symbol, timeframe, 500)
      .then((candles) => {
        if (!cancelled) {
          setCandles(candles);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load candles');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [symbol, timeframe, setCandles, setLoading, setError]);
}
