import { useEffect } from 'react';
import { useChartStore } from '@/stores/useChartStore';
import { useIndicatorStore } from '@/stores/useIndicatorStore';
import { useRiskStore } from '@/stores/useRiskStore';
import { calculateRisk } from '@/engine/riskCalculator';

export function useRisk() {
  const { candles } = useChartStore();
  const { indicators } = useIndicatorStore();
  const { accountSize, riskPercent, setRisk } = useRiskStore();

  useEffect(() => {
    if (!indicators || candles.length === 0) {
      setRisk(null);
      return;
    }
    const lastClose = candles[candles.length - 1].close;
    const risk = calculateRisk(lastClose, indicators.atr, accountSize, riskPercent);
    setRisk(risk);
  }, [candles, indicators, accountSize, riskPercent, setRisk]);
}
