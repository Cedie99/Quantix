import type { Signal, SignalType, IndicatorSet, Vote, SRLevel, Candle } from '@/types';
import { SIGNAL_THRESHOLDS } from '@/constants';
import { rsiVoter } from './voters/rsiVoter';
import { macdVoter } from './voters/macdVoter';
import { emaVoter } from './voters/emaVoter';
import { bollingerVoter } from './voters/bollingerVoter';
import { stochasticVoter } from './voters/stochasticVoter';
import { volumeVoter } from './voters/volumeVoter';
import { srVoter } from './voters/srVoter';
import { momentumVoter } from './voters/momentumVoter';

function scoreToType(score: number): SignalType {
  if (score >= SIGNAL_THRESHOLDS.STRONG_BUY)  return 'STRONG_BUY';
  if (score >= SIGNAL_THRESHOLDS.BUY)          return 'BUY';
  if (score <= SIGNAL_THRESHOLDS.STRONG_SELL)  return 'STRONG_SELL';
  if (score <= SIGNAL_THRESHOLDS.SELL)         return 'SELL';
  return 'NEUTRAL';
}

export function generateSignal(
  candles: Candle[],
  indicators: IndicatorSet,
  srLevels: SRLevel[]
): Signal | null {
  if (candles.length === 0) return null;

  const close = candles[candles.length - 1].close;

  // Collect votes — each voter receives candles for historical context
  const rsiVote      = rsiVoter(candles, indicators.rsi);
  const macdVote     = macdVoter(candles, indicators.macd);
  const emaVote      = emaVoter(close, indicators.ema9, indicators.ema21, indicators.ema50, indicators.ema200);
  const bbVote       = bollingerVoter(candles, indicators.bollingerBands);
  const stochVote    = stochasticVoter(candles, indicators.stochastic);
  const volVote      = volumeVoter(candles, indicators.volumeSMA);
  const srVote       = srVoter(close, srLevels, indicators.atr);
  const momentumVote = momentumVoter(candles);

  const votes: Vote[] = [rsiVote, macdVote, emaVote, bbVote, stochVote, volVote, srVote, momentumVote];

  // ── Score: weighted average of directional voters (Volume excluded) ───────
  let rawScore = 0;
  let maxScore = 0;

  for (const vote of votes) {
    if (vote.indicator === 'Volume') continue; // Volume acts only as multiplier
    rawScore += vote.vote * vote.weight;
    maxScore += vote.weight;
  }

  // Volume multiplier applied to the raw score (not maxScore), so high-volume
  // signals score higher and low-volume signals score lower, while the
  // normalization baseline stays fixed.
  const volumeMultiplier = volVote.multiplier;
  const amplifiedScore   = rawScore * volumeMultiplier;
  const normalizedScore  = maxScore > 0 ? (amplifiedScore / maxScore) * 100 : 0;
  const score            = Math.max(-100, Math.min(100, Math.round(normalizedScore)));

  // ── Confidence: % of total weight that agrees with the signal direction ───
  // This is independent of score magnitude — it measures agreement, not strength.
  // Example: score = +80 but only 3/8 indicators agree → confidence = 40% (uncertain)
  const signalDir = Math.sign(rawScore) as -1 | 0 | 1;
  let agreeWeight = 0;
  let totalWeight = 0;

  for (const vote of votes) {
    if (vote.indicator === 'Volume') continue;
    totalWeight += vote.weight;
    if (vote.vote !== 0 && Math.sign(vote.vote) === signalDir) {
      agreeWeight += vote.weight;
    }
  }

  const confidence = totalWeight > 0 ? Math.round((agreeWeight / totalWeight) * 100) : 0;
  const type       = scoreToType(score);

  return {
    type,
    score,
    confidence,
    votes,
    indicators,
    timestamp: Date.now(),
  };
}


