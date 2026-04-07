import type { Vote, SRLevel } from '@/types';
import { VOTER_WEIGHTS } from '@/constants';

/**
 * S/R Voter — evaluates proximity to key support/resistance levels.
 *
 * Key fixes from previous version:
 *  - Fixed 0.5% proximity threshold replaced with ATR-relative threshold (1× ATR).
 *    ATR adapts to each asset's volatility — what is "near" for BTC differs from XRP.
 *  - Level strength now scales the vote weight (tested 5× = stronger signal).
 *  - Finds the closest matching level rather than returning the first match.
 */
export function srVoter(close: number, srLevels: SRLevel[], atr: number | null): Vote {
  const weight = VOTER_WEIGHTS.SR;

  if (srLevels.length === 0) {
    return { indicator: 'S/R Levels', vote: 0, reason: 'No S/R levels detected', weight };
  }

  // ATR-relative proximity: price is "near" a level if within 1× ATR
  // Fallback: 0.8% of price if ATR not yet available
  const proximityThreshold = atr !== null && atr > 0
    ? atr / close
    : 0.008;

  // Find the closest level within the threshold (not just first match)
  let bestLevel: SRLevel | null = null;
  let bestProximity = Infinity;

  for (const level of srLevels) {
    const proximity = Math.abs(close - level.price) / close;
    if (proximity <= proximityThreshold && proximity < bestProximity) {
      bestProximity = proximity;
      bestLevel = level;
    }
  }

  if (!bestLevel) {
    return { indicator: 'S/R Levels', vote: 0, reason: 'Not near key levels', weight };
  }

  // Scale weight by level strength (strength 1 → 0.6×, strength 5+ → 1.0×)
  const strengthMultiplier = Math.min(1.0, 0.5 + bestLevel.strength * 0.1);
  const effectiveWeight = weight * strengthMultiplier;

  if (bestLevel.type === 'support') {
    return {
      indicator: 'S/R Levels',
      vote: 1,
      reason: `Near support $${bestLevel.price.toFixed(2)} (tested ${bestLevel.strength}×)`,
      weight: effectiveWeight,
    };
  }

  return {
    indicator: 'S/R Levels',
    vote: -1,
    reason: `Near resistance $${bestLevel.price.toFixed(2)} (tested ${bestLevel.strength}×)`,
    weight: effectiveWeight,
  };
}
