import type { Vote, Candle } from '@/types';
import { VOTER_WEIGHTS } from '@/constants';
import { extractCloses } from '@/utils/candles';
import { calculateRSISeries } from '@/services/indicators/rsi';

/**
 * RSI Voter — evaluates momentum, trend zone, and direction.
 *
 * Thresholds:
 *   < 30  Oversold   → BUY  (full weight if turning up, 0.7× if still falling)
 *   30–45 Recovery   → BUY  (0.6× weight only when RSI is rising)
 *   45–55 Neutral    → 0   (midline crossover gives small directional nudge)
 *   55–70 Hot zone   → SELL (0.6× weight only when RSI is falling)
 *   > 70  Overbought → SELL (full weight if turning down, 0.7× if still rising)
 */
export function rsiVoter(candles: Candle[], rsi: number | null): Vote {
  const weight = VOTER_WEIGHTS.RSI;

  if (rsi === null) {
    return { indicator: 'RSI', vote: 0, reason: 'Insufficient data', weight };
  }

  // Get previous RSI for direction detection
  const closes = extractCloses(candles);
  const series = calculateRSISeries(closes);
  const prevRsi = series.length >= 2 ? series[series.length - 2] : rsi;
  const rising = rsi > prevRsi + 0.15;
  const falling = rsi < prevRsi - 0.15;

  // ── Oversold zone (< 30) ─────────────────────────────────────────────────
  if (rsi < 30) {
    if (rising) {
      return { indicator: 'RSI', vote: 1, reason: `Oversold & turning up (${rsi.toFixed(1)}) ↑`, weight };
    }
    return { indicator: 'RSI', vote: 1, reason: `Deeply oversold (${rsi.toFixed(1)})`, weight: weight * 0.7 };
  }

  // ── Recovery from oversold (30–45): bullish only when rising ─────────────
  if (rsi < 45) {
    if (rising) {
      return { indicator: 'RSI', vote: 1, reason: `Recovering from oversold (${rsi.toFixed(1)}) ↑`, weight: weight * 0.6 };
    }
    return { indicator: 'RSI', vote: 0, reason: `Oversold zone, still falling (${rsi.toFixed(1)}) ↓`, weight };
  }

  // ── Overbought zone (> 70) ────────────────────────────────────────────────
  if (rsi > 70) {
    if (falling) {
      return { indicator: 'RSI', vote: -1, reason: `Overbought & turning down (${rsi.toFixed(1)}) ↓`, weight };
    }
    return { indicator: 'RSI', vote: -1, reason: `Deeply overbought (${rsi.toFixed(1)})`, weight: weight * 0.7 };
  }

  // ── Approaching overbought (55–70): bearish only when falling ─────────────
  if (rsi > 55) {
    if (falling) {
      return { indicator: 'RSI', vote: -1, reason: `Declining from hot zone (${rsi.toFixed(1)}) ↓`, weight: weight * 0.6 };
    }
    return { indicator: 'RSI', vote: 0, reason: `Bullish zone, still rising (${rsi.toFixed(1)}) ↑`, weight };
  }

  // ── Midline (45–55): small directional signal from 50-crossover ──────────
  if (prevRsi < 50 && rsi >= 50) {
    return { indicator: 'RSI', vote: 1, reason: `Crossed above 50 (${rsi.toFixed(1)}) ↑`, weight: weight * 0.4 };
  }
  if (prevRsi > 50 && rsi <= 50) {
    return { indicator: 'RSI', vote: -1, reason: `Crossed below 50 (${rsi.toFixed(1)}) ↓`, weight: weight * 0.4 };
  }

  return { indicator: 'RSI', vote: 0, reason: `Neutral (${rsi.toFixed(1)})`, weight };
}
