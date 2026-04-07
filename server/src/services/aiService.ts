import Anthropic from '@anthropic-ai/sdk';
import { cacheService } from './cacheService';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface AIAnalysisRequest {
  symbol: string;
  timeframe: string;
  price: number;
  signal: {
    type: string;
    score: number;
    confidence: number;
    votes: Array<{ indicator: string; vote: number; reason: string; weight: number }>;
  };
  fearGreed: { value: number; classification: string } | null;
  marketOverview: { btcDominance: number; marketCapChangePercentage24h: number } | null;
  fundingRate: number | null;
  news: Array<{ title: string; sentiment: string; publishedAt: string }>;
}

export interface AIAnalysisResult {
  verdict: 'CONFIRM_BUY' | 'HOLD' | 'CONFIRM_SELL' | 'CAUTION' | 'STRONG_CAUTION';
  confidenceModifier: 'BOOST' | 'NEUTRAL' | 'REDUCE';
  keyInsight: string;
  risks: string[];
  contextSummary: string;
}

export async function runAIAnalysis(req: AIAnalysisRequest): Promise<AIAnalysisResult> {
  const cacheKey = `ai:${req.symbol}:${req.signal.type}:${Math.floor(Date.now() / 60_000)}`;
  const cached = cacheService.get<AIAnalysisResult>(cacheKey);
  if (cached) return cached;

  const voteLines = req.signal.votes
    .map(v => `  - ${v.indicator}: ${v.vote > 0 ? 'BUY' : v.vote < 0 ? 'SELL' : 'NEUTRAL'} — ${v.reason}`)
    .join('\n');
  const newsLines = req.news.length
    ? req.news.map(n => `  - [${n.sentiment}] "${n.title}" (${n.publishedAt})`).join('\n')
    : '  (no news available)';

  const prompt = `You are a concise crypto trading assistant. Analyze the following and respond with valid JSON only.

SYMBOL: ${req.symbol} @ $${req.price.toFixed(2)} (${req.timeframe} chart)

TECHNICAL ANALYSIS:
- Signal: ${req.signal.type.replace('_', ' ')}
- Score: ${req.signal.score > 0 ? '+' : ''}${req.signal.score}/100
- Indicator Agreement: ${req.signal.confidence}%
- Votes:
${voteLines}

MARKET CONTEXT:
- Fear & Greed: ${req.fearGreed ? `${req.fearGreed.value} (${req.fearGreed.classification})` : 'unavailable'}
- BTC Dominance: ${req.marketOverview ? `${req.marketOverview.btcDominance.toFixed(1)}%` : 'unavailable'}
- 24h Market Cap Change: ${req.marketOverview ? `${req.marketOverview.marketCapChangePercentage24h.toFixed(2)}%` : 'unavailable'}
- Futures Funding Rate: ${req.fundingRate !== null ? `${(req.fundingRate * 100).toFixed(4)}%` : 'unavailable'}

NEWS:
${newsLines}

Respond with ONLY this JSON (no markdown, no extra text):
{
  "verdict": "CONFIRM_BUY|HOLD|CONFIRM_SELL|CAUTION|STRONG_CAUTION",
  "confidenceModifier": "BOOST|NEUTRAL|REDUCE",
  "keyInsight": "one sentence, the most important factor driving this verdict",
  "risks": ["risk 1 (max 10 words)", "risk 2 (max 10 words)"],
  "contextSummary": "2-3 sentences synthesizing the full picture"
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = (message.content[0] as { type: string; text: string }).text.trim();
  const result: AIAnalysisResult = JSON.parse(text);

  cacheService.set(cacheKey, result, 60_000);
  return result;
}
