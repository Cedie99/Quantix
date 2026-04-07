import type { Vote, Candle } from '@/types';
import { VOTER_WEIGHTS } from '@/constants';

/**
 * Volume Voter — directional volume analysis.
 *
 * Key fixes from previous version:
 *  - vote was always +1 on high volume regardless of price direction (wrong)
 *  - multiplier used a step-function with a 50% cliff (0.7 or 1.0 or 1.5)
 *  - multiplier now linearly interpolated between 0.7 and 1.5
 *
 * The vote direction is determined by candle color (close vs open):
 *  - High volume + bullish candle → confirms buy pressure
 *  - High volume + bearish candle → confirms sell pressure
 *  - Low volume → weakens the signal (multiplier < 1)
 */
export function volumeVoter(candles: Candle[], volumeSMA: number | null): Vote & { multiplier: number } {
  const weight = VOTER_WEIGHTS.VOLUME;
  const last = candles[candles.length - 1];
  const currentVolume = last.volume;

  if (volumeSMA === null || volumeSMA === 0) {
    return { indicator: 'Volume', vote: 0, reason: 'Insufficient data', weight, multiplier: 1 };
  }

  const ratio = currentVolume / volumeSMA;

  // Linear interpolation: multiplier scales smoothly from 0.7 (low) to 1.5 (high)
  // No cliff artifacts — ratio 1.49 and 1.50 get nearly identical multipliers
  const multiplier = Math.max(0.7, Math.min(1.5, ratio));

  const isBullishCandle = last.close >= last.open;
  const isHighVolume    = ratio >= 1.3;
  const isLowVolume     = ratio <= 0.7;

  if (isHighVolume) {
    const dir = isBullishCandle ? 'bullish' : 'bearish';
    return {
      indicator: 'Volume',
      vote: isBullishCandle ? 1 : -1,
      reason: `High volume (${ratio.toFixed(1)}× SMA) — ${dir} confirmation`,
      weight,
      multiplier,
    };
  }

  if (isLowVolume) {
    return {
      indicator: 'Volume',
      vote: 0,
      reason: `Low volume (${ratio.toFixed(1)}× SMA) — signal weakened`,
      weight,
      multiplier,
    };
  }

  return {
    indicator: 'Volume',
    vote: 0,
    reason: `Normal volume (${ratio.toFixed(1)}× SMA)`,
    weight,
    multiplier: 1,
  };
}
