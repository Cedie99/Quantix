import type { Candle, IndicatorSet } from '@/types';
import { extractCloses, extractHighs, extractLows, extractVolumes } from '@/utils/candles';
import { calculateRSI } from './rsi';
import { calculateMACD } from './macd';
import { calculateBollingerBands } from './bollingerBands';
import { calculateEMA9, calculateEMA21, calculateEMA50, calculateEMA200 } from './ema';
import { calculateStochastic } from './stochastic';
import { calculateATR } from './atr';
import { calculateVolumeSMA } from './volume';

export function calculateAllIndicators(candles: Candle[]): IndicatorSet {
  const closes = extractCloses(candles);
  const highs = extractHighs(candles);
  const lows = extractLows(candles);
  const volumes = extractVolumes(candles);

  return {
    rsi: calculateRSI(closes),
    macd: calculateMACD(closes),
    bollingerBands: calculateBollingerBands(closes),
    ema9: calculateEMA9(closes),
    ema21: calculateEMA21(closes),
    ema50: calculateEMA50(closes),
    ema200: calculateEMA200(closes),
    stochastic: calculateStochastic(highs, lows, closes),
    atr: calculateATR(highs, lows, closes),
    volumeSMA: calculateVolumeSMA(volumes),
  };
}
