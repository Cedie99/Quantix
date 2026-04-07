import { EMA } from 'technicalindicators';
import { INDICATOR_MIN_CANDLES } from '@/constants';

function calcEMA(closes: number[], period: number, minCandles: number): number | null {
  if (closes.length < minCandles) return null;
  const result = EMA.calculate({ period, values: closes });
  return result.length > 0 ? result[result.length - 1] : null;
}

function calcEMASeries(closes: number[], period: number, minCandles: number): number[] {
  if (closes.length < minCandles) return [];
  return EMA.calculate({ period, values: closes });
}

export const calculateEMA9 = (closes: number[]) => calcEMA(closes, 9, INDICATOR_MIN_CANDLES.EMA9);
export const calculateEMA21 = (closes: number[]) => calcEMA(closes, 21, INDICATOR_MIN_CANDLES.EMA21);
export const calculateEMA50 = (closes: number[]) => calcEMA(closes, 50, INDICATOR_MIN_CANDLES.EMA50);
export const calculateEMA200 = (closes: number[]) => calcEMA(closes, 200, INDICATOR_MIN_CANDLES.EMA200);

export const calculateEMA9Series = (closes: number[]) => calcEMASeries(closes, 9, INDICATOR_MIN_CANDLES.EMA9);
export const calculateEMA21Series = (closes: number[]) => calcEMASeries(closes, 21, INDICATOR_MIN_CANDLES.EMA21);
export const calculateEMA50Series = (closes: number[]) => calcEMASeries(closes, 50, INDICATOR_MIN_CANDLES.EMA50);
export const calculateEMA200Series = (closes: number[]) => calcEMASeries(closes, 200, INDICATOR_MIN_CANDLES.EMA200);
