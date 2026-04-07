import { RSI } from 'technicalindicators';
import { INDICATOR_MIN_CANDLES } from '@/constants';

export function calculateRSI(closes: number[], period = 14): number | null {
  if (closes.length < INDICATOR_MIN_CANDLES.RSI) return null;
  const result = RSI.calculate({ period, values: closes });
  return result.length > 0 ? result[result.length - 1] : null;
}

export function calculateRSISeries(closes: number[], period = 14): number[] {
  if (closes.length < INDICATOR_MIN_CANDLES.RSI) return [];
  return RSI.calculate({ period, values: closes });
}
