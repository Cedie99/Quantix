import { useEffect } from 'react';
import { useChartStore } from '@/stores/useChartStore';
import { useIndicatorStore } from '@/stores/useIndicatorStore';
import { calculateAllIndicators } from '@/services/indicators/calculator';

export function useIndicators() {
  const { candles } = useChartStore();
  const { setIndicators } = useIndicatorStore();

  useEffect(() => {
    if (candles.length === 0) {
      setIndicators(null);
      return;
    }
    const indicators = calculateAllIndicators(candles);
    setIndicators(indicators);
  }, [candles, setIndicators]);
}
