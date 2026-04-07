import type { Vote } from '@/types';
import { VOTER_WEIGHTS } from '@/constants';

/**
 * EMA Voter — weighted scoring across 4 EMA periods.
 *
 * Weights per condition (total possible ±10):
 *   Price vs EMA200     ±3  (primary trend — most important)
 *   EMA50 vs EMA200     ±2  (golden/death cross context)
 *   Price vs EMA50      ±2  (medium-term trend)
 *   EMA9 vs EMA21       ±1  (short-term momentum)
 *   Price vs EMA21      ±1  (short-term position)
 *   Price vs EMA9       ±1  (immediate momentum)
 *
 * Vote direction: normalized score > +30% = 1, < -30% = -1, else 0.
 * This requires ~3 of the stronger conditions to agree before firing.
 */
export function emaVoter(
  close: number,
  ema9: number | null,
  ema21: number | null,
  ema50: number | null,
  ema200: number | null
): Vote {
  const weight = VOTER_WEIGHTS.EMA;

  if (ema9 === null && ema21 === null && ema50 === null && ema200 === null) {
    return { indicator: 'EMA', vote: 0, reason: 'Insufficient data', weight };
  }

  let score = 0;
  let maxScore = 0;
  const reasons: string[] = [];

  // ── EMA200: primary trend filter (weight ±3) ─────────────────────────────
  if (ema200 !== null) {
    if (close > ema200) {
      score += 3;
      reasons.push('Price > EMA200 (uptrend)');
    } else {
      score -= 3;
      reasons.push('Price < EMA200 (downtrend)');
    }
    maxScore += 3;
  }

  // ── EMA50 vs EMA200: golden/death cross context (weight ±2) ──────────────
  if (ema50 !== null && ema200 !== null) {
    if (ema50 > ema200) {
      score += 2;
      reasons.push('EMA50 > EMA200 (golden cross zone)');
    } else {
      score -= 2;
      reasons.push('EMA50 < EMA200 (death cross zone)');
    }
    maxScore += 2;
  }

  // ── Price vs EMA50: medium-term trend (weight ±2) ─────────────────────────
  if (ema50 !== null) {
    if (close > ema50) {
      score += 2;
    } else {
      score -= 2;
    }
    maxScore += 2;
  }

  // ── EMA9 vs EMA21: short-term momentum (weight ±1) ───────────────────────
  if (ema9 !== null && ema21 !== null) {
    if (ema9 > ema21) {
      score += 1;
      reasons.push('EMA9 > EMA21');
    } else {
      score -= 1;
      reasons.push('EMA9 < EMA21');
    }
    maxScore += 1;

    // ── Price vs EMA21 (weight ±1) ──────────────────────────────────────────
    if (close > ema21) {
      score += 1;
    } else {
      score -= 1;
    }
    maxScore += 1;
  }

  // ── Price vs EMA9: immediate momentum (weight ±1, only if EMA50 available) ─
  if (ema9 !== null && ema50 !== null) {
    if (close > ema9) {
      score += 1;
    } else {
      score -= 1;
    }
    maxScore += 1;
  }

  if (maxScore === 0) {
    return { indicator: 'EMA', vote: 0, reason: 'Insufficient data', weight };
  }

  const normalized = score / maxScore; // -1.0 to +1.0
  const vote: -1 | 0 | 1 = normalized > 0.3 ? 1 : normalized < -0.3 ? -1 : 0;

  return {
    indicator: 'EMA',
    vote,
    reason: reasons.slice(0, 2).join(', ') || 'Mixed EMAs',
    weight,
  };
}
