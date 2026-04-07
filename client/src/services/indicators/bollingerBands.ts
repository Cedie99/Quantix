import { BollingerBands } from 'technicalindicators';
import type { BollingerBandsResult } from '@/types';
import { INDICATOR_MIN_CANDLES } from '@/constants';

export function calculateBollingerBands(closes: number[], period = 20, stdDev = 2): BollingerBandsResult | null {
  if (closes.length < INDICATOR_MIN_CANDLES.BB) return null;

  const result = BollingerBands.calculate({ period, stdDev, values: closes });
  if (result.length === 0) return null;

  const last = result[result.length - 1];
  return { upper: last.upper, middle: last.middle, lower: last.lower };
}

export function calculateBollingerBandsSeries(closes: number[], period = 20, stdDev = 2): BollingerBandsResult[] {
  if (closes.length < INDICATOR_MIN_CANDLES.BB) return [];
  return BollingerBands.calculate({ period, stdDev, values: closes }).map((r) => ({
    upper: r.upper,
    middle: r.middle,
    lower: r.lower,
  }));
}
