import type { Vote, Candle } from '@/types';
import { VOTER_WEIGHTS } from '@/constants';

/**
 * Momentum Voter — Price Rate of Change (ROC).
 *
 * Measures the speed and direction of price movement over two windows:
 *  - 14-bar ROC: medium-term trend momentum
 *  - 3-bar ROC: short-term confirmation
 *
 * Both windows must agree in direction to issue a full-weight vote.
 * Conflicting windows reduce to neutral.
 *
 * Thresholds are percentage-based and cryptocurrency-aware:
 *   Strong: ±4% over 14 bars
 *   Mild:   ±1.5% over 14 bars
 */
export function momentumVoter(candles: Candle[]): Vote {
  const weight = VOTER_WEIGHTS.MOMENTUM;

  if (candles.length < 15) {
    return { indicator: 'Momentum', vote: 0, reason: 'Insufficient data', weight };
  }

  const close    = candles[candles.length - 1].close;
  const close14  = candles[candles.length - 14].close;
  const close3   = candles[candles.length - 4].close;

  const roc14 = ((close - close14) / close14) * 100;
  const roc3  = ((close - close3)  / close3)  * 100;

  const bullishMomentum = roc14 > 0 && roc3 > 0;
  const bearishMomentum = roc14 < 0 && roc3 < 0;

  // Strong agreement: both windows bullish
  if (bullishMomentum && roc14 > 4) {
    return {
      indicator: 'Momentum',
      vote: 1,
      reason: `Strong upward momentum (ROC14: +${roc14.toFixed(1)}%)`,
      weight,
    };
  }
  if (bearishMomentum && roc14 < -4) {
    return {
      indicator: 'Momentum',
      vote: -1,
      reason: `Strong downward momentum (ROC14: ${roc14.toFixed(1)}%)`,
      weight,
    };
  }

  // Mild agreement
  if (bullishMomentum && roc14 > 1.5) {
    return {
      indicator: 'Momentum',
      vote: 1,
      reason: `Positive momentum (ROC14: +${roc14.toFixed(1)}%)`,
      weight: weight * 0.6,
    };
  }
  if (bearishMomentum && roc14 < -1.5) {
    return {
      indicator: 'Momentum',
      vote: -1,
      reason: `Negative momentum (ROC14: ${roc14.toFixed(1)}%)`,
      weight: weight * 0.6,
    };
  }

  // Conflicting or flat
  const sign = roc14 >= 0 ? '+' : '';
  return {
    indicator: 'Momentum',
    vote: 0,
    reason: `Neutral momentum (ROC14: ${sign}${roc14.toFixed(1)}%)`,
    weight,
  };
}
