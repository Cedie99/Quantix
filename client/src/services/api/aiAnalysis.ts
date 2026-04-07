import axios from 'axios';
import type { Signal } from '@/types';

export async function fetchAIAnalysis(
  symbol: string,
  timeframe: string,
  price: number,
  signal: Signal,
) {
  const { data } = await axios.post('/api/ai/analyze', {
    symbol,
    timeframe,
    price,
    signal: {
      type: signal.type,
      score: signal.score,
      confidence: signal.confidence,
      votes: signal.votes,
    },
  });
  return data;
}
