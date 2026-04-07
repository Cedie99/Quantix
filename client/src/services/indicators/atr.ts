import { ATR } from 'technicalindicators';
import { INDICATOR_MIN_CANDLES } from '@/constants';

export function calculateATR(highs: number[], lows: number[], closes: number[], period = 14): number | null {
  if (closes.length < INDICATOR_MIN_CANDLES.ATR) return null;

  const result = ATR.calculate({ high: highs, low: lows, close: closes, period });
  return result.length > 0 ? result[result.length - 1] : null;
}
