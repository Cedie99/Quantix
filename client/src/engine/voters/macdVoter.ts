import type { Vote, MACDResult, Candle } from '@/types';
import { VOTER_WEIGHTS } from '@/constants';
import { extractCloses } from '@/utils/candles';
import { calculateMACDSeries } from '@/services/indicators/macd';

/**
 * MACD Voter — detects trend direction using signal-line crossovers,
 * histogram zero-line crosses, and histogram slope (acceleration).
 *
 * Signal priority (strongest → weakest):
 *   1. Histogram crosses zero      (trend reversal confirmation)
 *   2. MACD crosses signal line    (entry signal)
 *   3. Histogram accelerating      (momentum building)
 *   4. Histogram decelerating      (momentum fading — counter-trend warning)
 */
export function macdVoter(candles: Candle[], macd: MACDResult | null): Vote {
  const weight = VOTER_WEIGHTS.MACD;

  if (macd === null) {
    return { indicator: 'MACD', vote: 0, reason: 'Insufficient data', weight };
  }

  // Get previous MACD values for slope and crossover detection
  const closes = extractCloses(candles);
  const series = calculateMACDSeries(closes);
  const prev = series.length >= 2 ? series[series.length - 2] : null;

  const { MACD: macdLine, signal, histogram } = macd;
  const prevHistogram = prev?.histogram ?? histogram;
  const prevMacd     = prev?.MACD     ?? macdLine;
  const prevSignal   = prev?.signal   ?? signal;

  const histGrowing   = histogram > prevHistogram;  // true slope check
  const histShrinking = histogram < prevHistogram;

  // ── 1. Histogram zero-line cross (strongest) ─────────────────────────────
  if (prevHistogram < 0 && histogram >= 0) {
    return {
      indicator: 'MACD',
      vote: 1,
      reason: `Histogram crossed zero ↑ (${histogram.toFixed(4)})`,
      weight,
    };
  }
  if (prevHistogram > 0 && histogram <= 0) {
    return {
      indicator: 'MACD',
      vote: -1,
      reason: `Histogram crossed zero ↓ (${histogram.toFixed(4)})`,
      weight,
    };
  }

  // ── 2. MACD signal-line crossover ────────────────────────────────────────
  const bullishCrossover = prevMacd <= prevSignal && macdLine > signal;
  const bearishCrossover = prevMacd >= prevSignal && macdLine < signal;

  if (bullishCrossover) {
    return {
      indicator: 'MACD',
      vote: 1,
      reason: `Bullish signal-line cross (hist: ${histogram.toFixed(4)})`,
      weight,
    };
  }
  if (bearishCrossover) {
    return {
      indicator: 'MACD',
      vote: -1,
      reason: `Bearish signal-line cross (hist: ${histogram.toFixed(4)})`,
      weight,
    };
  }

  // ── 3. Histogram momentum (acceleration) ─────────────────────────────────
  if (histogram > 0 && histGrowing) {
    return {
      indicator: 'MACD',
      vote: 1,
      reason: `Bullish momentum accelerating (hist: ${histogram.toFixed(4)})`,
      weight: weight * 0.6,
    };
  }
  if (histogram < 0 && histShrinking) {
    return {
      indicator: 'MACD',
      vote: -1,
      reason: `Bearish momentum deepening (hist: ${histogram.toFixed(4)})`,
      weight: weight * 0.6,
    };
  }

  // ── 4. Histogram deceleration (counter-trend warning) ────────────────────
  if (histogram > 0 && histShrinking) {
    return {
      indicator: 'MACD',
      vote: -1,
      reason: `Bullish momentum fading (hist: ${histogram.toFixed(4)})`,
      weight: weight * 0.4,
    };
  }
  if (histogram < 0 && histGrowing) {
    return {
      indicator: 'MACD',
      vote: 1,
      reason: `Bearish momentum easing (hist: ${histogram.toFixed(4)})`,
      weight: weight * 0.4,
    };
  }

  // ── Zero-line context for unchanged histogram ─────────────────────────────
  if (macdLine > 0 && signal > 0) {
    return { indicator: 'MACD', vote: 0, reason: `Both lines positive (mild bull bias)`, weight };
  }
  if (macdLine < 0 && signal < 0) {
    return { indicator: 'MACD', vote: 0, reason: `Both lines negative (mild bear bias)`, weight };
  }

  return { indicator: 'MACD', vote: 0, reason: 'Conflicting signals', weight };
}
