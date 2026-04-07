import type { Candle, SRLevel } from '@/types';

const MIN_CANDLES   = 30;
const LOOKBACK      = 5;
const MAX_LEVELS    = 8;
const CLUSTER_TOL   = 0.003; // 0.3% clustering tolerance

/**
 * isPivotHigh — uses strict (>) comparison so that two consecutive candles
 * with the same high are both eligible pivot candidates (they'll cluster later).
 * Previous: >= caused flat-top formations to be completely missed.
 */
function isPivotHigh(candles: Candle[], i: number, lookback: number): boolean {
  const high = candles[i].high;
  for (let j = i - lookback; j <= i + lookback; j++) {
    if (j === i || j < 0 || j >= candles.length) continue;
    if (candles[j].high > high) return false; // strict > allows equal-high neighbors
  }
  return true;
}

/**
 * isPivotLow — same fix: strict < to allow flat-bottom detection.
 */
function isPivotLow(candles: Candle[], i: number, lookback: number): boolean {
  const low = candles[i].low;
  for (let j = i - lookback; j <= i + lookback; j++) {
    if (j === i || j < 0 || j >= candles.length) continue;
    if (candles[j].low < low) return false; // strict <
  }
  return true;
}

/**
 * clusterLevels — merges nearby levels of the same type.
 *
 * Fixed: previously used (existing + new) / 2 which is a biased running average
 * (weights earlier clusters more heavily). Now uses the true running mean:
 *   newMean = (oldMean * (n-1) + newPrice) / n
 */
function clusterLevels(
  levels: { price: number; type: 'support' | 'resistance' }[]
): SRLevel[] {
  const result: SRLevel[] = [];

  for (const level of levels) {
    const existing = result.find(
      (r) => r.type === level.type &&
             Math.abs(r.price - level.price) / r.price <= CLUSTER_TOL
    );

    if (existing) {
      existing.strength++;
      // True running mean: unbiased regardless of merge order
      existing.price = (existing.price * (existing.strength - 1) + level.price) / existing.strength;
    } else {
      result.push({ price: level.price, type: level.type, strength: 1 });
    }
  }

  return result.sort((a, b) => b.strength - a.strength).slice(0, MAX_LEVELS);
}

export function detectSRLevels(candles: Candle[]): SRLevel[] {
  if (candles.length < MIN_CANDLES) return [];

  const rawLevels: { price: number; type: 'support' | 'resistance' }[] = [];

  for (let i = LOOKBACK; i < candles.length - LOOKBACK; i++) {
    if (isPivotHigh(candles, i, LOOKBACK)) {
      rawLevels.push({ price: candles[i].high, type: 'resistance' });
    }
    if (isPivotLow(candles, i, LOOKBACK)) {
      rawLevels.push({ price: candles[i].low, type: 'support' });
    }
  }

  return clusterLevels(rawLevels);
}
