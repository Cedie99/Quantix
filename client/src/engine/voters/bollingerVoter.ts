import type { Vote, BollingerBandsResult, Candle } from '@/types';
import { VOTER_WEIGHTS } from '@/constants';

/**
 * Bollinger Bands Voter — price position relative to bands with squeeze context.
 *
 * Key improvements over naive band-touch logic:
 *  - Squeeze detection: tight bands (bandwidth < 2% of price) precede breakouts,
 *    so band touches during a squeeze are ambiguous — weight reduced.
 *  - %B position: graduated weight as price moves toward extremes.
 *  - Midline directional context: above/below middle SMA carries mild bias.
 */
export function bollingerVoter(candles: Candle[], bb: BollingerBandsResult | null): Vote {
  const weight = VOTER_WEIGHTS.BOLLINGER;
  const close = candles[candles.length - 1].close;

  if (bb === null) {
    return { indicator: 'Bollinger Bands', vote: 0, reason: 'Insufficient data', weight };
  }

  const { upper, lower, middle } = bb;
  const bandWidth = upper - lower;
  const pctB = bandWidth > 0 ? (close - lower) / bandWidth : 0.5; // 0=lower, 0.5=mid, 1=upper

  // Squeeze: bandwidth < 2% of price → low volatility, breakout pending
  const bwRelative = bandWidth / middle;
  const isSqueeze = bwRelative < 0.02;

  // ── Price at/below lower band ─────────────────────────────────────────────
  if (close <= lower) {
    if (isSqueeze) {
      return {
        indicator: 'Bollinger Bands',
        vote: 0,
        reason: `Band touch during squeeze — breakout direction unclear`,
        weight: weight * 0.4,
      };
    }
    return {
      indicator: 'Bollinger Bands',
      vote: 1,
      reason: `Price at lower band ($${lower.toFixed(2)}) — mean-reversion buy`,
      weight,
    };
  }

  // ── Price at/above upper band ─────────────────────────────────────────────
  if (close >= upper) {
    if (isSqueeze) {
      return {
        indicator: 'Bollinger Bands',
        vote: 0,
        reason: `Band touch during squeeze — breakout direction unclear`,
        weight: weight * 0.4,
      };
    }
    return {
      indicator: 'Bollinger Bands',
      vote: -1,
      reason: `Price at upper band ($${upper.toFixed(2)}) — mean-reversion sell`,
      weight,
    };
  }

  // ── Near lower band (bottom 20%, %B < 0.2) ───────────────────────────────
  if (pctB < 0.2) {
    return {
      indicator: 'Bollinger Bands',
      vote: 1,
      reason: `Near lower band (${(pctB * 100).toFixed(0)}%B)${isSqueeze ? ' — squeeze' : ''}`,
      weight: weight * 0.5,
    };
  }

  // ── Near upper band (top 20%, %B > 0.8) ──────────────────────────────────
  if (pctB > 0.8) {
    return {
      indicator: 'Bollinger Bands',
      vote: -1,
      reason: `Near upper band (${(pctB * 100).toFixed(0)}%B)${isSqueeze ? ' — squeeze' : ''}`,
      weight: weight * 0.5,
    };
  }

  // ── Midline context: above/below middle SMA ───────────────────────────────
  // Midline crossover carries a mild directional bias
  const sqzNote = isSqueeze ? ' (squeeze — expect breakout)' : '';
  if (pctB > 0.5) {
    return {
      indicator: 'Bollinger Bands',
      vote: 0,
      reason: `Above midline (${(pctB * 100).toFixed(0)}%B)${sqzNote}`,
      weight,
    };
  }
  return {
    indicator: 'Bollinger Bands',
    vote: 0,
    reason: `Below midline (${(pctB * 100).toFixed(0)}%B)${sqzNote}`,
    weight,
  };
}
