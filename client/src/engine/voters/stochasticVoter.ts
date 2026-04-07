import type { Vote, StochasticResult, Candle } from '@/types';
import { VOTER_WEIGHTS } from '@/constants';
import { extractCloses, extractHighs, extractLows } from '@/utils/candles';
import { calculateStochasticSeries } from '@/services/indicators/stochastic';

/**
 * Stochastic Voter — detects true K/D crossover events and extreme-zone exits.
 *
 * Previous implementation used K > D (static position), which fires on every
 * candle once K is above D, making it impossible to distinguish a fresh cross
 * from a cross that happened 20 bars ago.
 *
 * Signal priority:
 *   1. K/D cross from inside extreme zone → strongest (full weight)
 *   2. K exiting oversold (K rises above 20) or overbought (K drops below 80)
 *   3. K/D cross in neutral zone → weak signal (0.4× weight)
 *   4. Static extreme zone (no cross) → mild signal (0.5× weight)
 */
export function stochasticVoter(candles: Candle[], stoch: StochasticResult | null): Vote {
  const weight = VOTER_WEIGHTS.STOCHASTIC;

  if (stoch === null) {
    return { indicator: 'Stochastic', vote: 0, reason: 'Insufficient data', weight };
  }

  // Get previous K/D for true crossover detection
  const closes = extractCloses(candles);
  const highs  = extractHighs(candles);
  const lows   = extractLows(candles);
  const series = calculateStochasticSeries(highs, lows, closes);
  const prev   = series.length >= 2 ? series[series.length - 2] : null;

  const { k, d } = stoch;
  const prevK = prev?.k ?? k;
  const prevD = prev?.d ?? d;

  // True crossover: K and D swapped sides since last candle
  const bullishCross = prevK <= prevD && k > d;
  const bearishCross = prevK >= prevD && k < d;

  const inOversold   = k < 20;
  const inOverbought = k > 80;

  // Exiting extreme zone (the actual tradeable signal)
  const exitingOversold   = prevK < 20 && k >= 20;
  const exitingOverbought = prevK > 80 && k <= 80;

  // ── 1. Crossover inside extreme zone (strongest) ─────────────────────────
  if (bullishCross && (inOversold || prevK < 20)) {
    return {
      indicator: 'Stochastic',
      vote: 1,
      reason: `Bullish K/D cross from oversold (K=${k.toFixed(1)})`,
      weight,
    };
  }
  if (bearishCross && (inOverbought || prevK > 80)) {
    return {
      indicator: 'Stochastic',
      vote: -1,
      reason: `Bearish K/D cross from overbought (K=${k.toFixed(1)})`,
      weight,
    };
  }

  // ── 2. Exiting extreme zone ───────────────────────────────────────────────
  if (exitingOversold) {
    return {
      indicator: 'Stochastic',
      vote: 1,
      reason: `K rising above 20 — exiting oversold (K=${k.toFixed(1)})`,
      weight,
    };
  }
  if (exitingOverbought) {
    return {
      indicator: 'Stochastic',
      vote: -1,
      reason: `K falling below 80 — exiting overbought (K=${k.toFixed(1)})`,
      weight,
    };
  }

  // ── 3. Crossover in neutral zone (weak signal) ────────────────────────────
  if (bullishCross) {
    return {
      indicator: 'Stochastic',
      vote: 1,
      reason: `Bullish K/D cross (K=${k.toFixed(1)})`,
      weight: weight * 0.4,
    };
  }
  if (bearishCross) {
    return {
      indicator: 'Stochastic',
      vote: -1,
      reason: `Bearish K/D cross (K=${k.toFixed(1)})`,
      weight: weight * 0.4,
    };
  }

  // ── 4. Static extreme zone (no fresh cross) ───────────────────────────────
  if (inOversold) {
    return {
      indicator: 'Stochastic',
      vote: 1,
      reason: `Oversold zone (K=${k.toFixed(1)}, D=${d.toFixed(1)})`,
      weight: weight * 0.5,
    };
  }
  if (inOverbought) {
    return {
      indicator: 'Stochastic',
      vote: -1,
      reason: `Overbought zone (K=${k.toFixed(1)}, D=${d.toFixed(1)})`,
      weight: weight * 0.5,
    };
  }

  return {
    indicator: 'Stochastic',
    vote: 0,
    reason: `Neutral (K=${k.toFixed(1)}, D=${d.toFixed(1)})`,
    weight,
  };
}
