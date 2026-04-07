import { Stochastic } from 'technicalindicators';
import type { StochasticResult } from '@/types';
import { INDICATOR_MIN_CANDLES } from '@/constants';

export function calculateStochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14,
  signalPeriod = 3
): StochasticResult | null {
  if (closes.length < INDICATOR_MIN_CANDLES.STOCHASTIC) return null;

  const result = Stochastic.calculate({
    high: highs,
    low: lows,
    close: closes,
    period,
    signalPeriod,
  });

  if (result.length === 0) return null;
  const last = result[result.length - 1];
  return { k: last.k, d: last.d };
}

export function calculateStochasticSeries(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14,
  signalPeriod = 3
): StochasticResult[] {
  if (closes.length < INDICATOR_MIN_CANDLES.STOCHASTIC) return [];
  return Stochastic.calculate({
    high: highs,
    low: lows,
    close: closes,
    period,
    signalPeriod,
  }).map((r) => ({ k: r.k, d: r.d }));
}
