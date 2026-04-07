import { MACD } from 'technicalindicators';
import type { MACDResult } from '@/types';
import { INDICATOR_MIN_CANDLES } from '@/constants';

export function calculateMACD(closes: number[]): MACDResult | null {
  if (closes.length < INDICATOR_MIN_CANDLES.MACD) return null;

  const result = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  if (result.length === 0) return null;
  const last = result[result.length - 1];
  return {
    MACD: last.MACD ?? 0,
    signal: last.signal ?? 0,
    histogram: last.histogram ?? 0,
  };
}

export function calculateMACDSeries(closes: number[]): MACDResult[] {
  if (closes.length < INDICATOR_MIN_CANDLES.MACD) return [];
  const result = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  return result.map((r) => ({
    MACD: r.MACD ?? 0,
    signal: r.signal ?? 0,
    histogram: r.histogram ?? 0,
  }));
}
