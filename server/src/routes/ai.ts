import { Router, Request, Response, NextFunction } from 'express';
import { runAIAnalysis, AIAnalysisRequest } from '../services/aiService';
import { getFearGreedIndex, getMarketOverview } from '../services/coinGeckoService';
import { getFundingRate } from '../services/binanceService';

const router = Router();

router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbol, timeframe, price, signal } = req.body;
    if (!symbol || !signal) {
      res.status(400).json({ error: 'symbol and signal are required' });
      return;
    }

    const [fearGreed, marketOverview, fundingRate] = await Promise.allSettled([
      getFearGreedIndex(),
      getMarketOverview(),
      getFundingRate(String(symbol)),
    ]);

    const analysisReq: AIAnalysisRequest = {
      symbol: String(symbol),
      timeframe: String(timeframe ?? ''),
      price: Number(price),
      signal,
      fearGreed: fearGreed.status === 'fulfilled'
        ? (fearGreed.value as AIAnalysisRequest['fearGreed'])
        : null,
      marketOverview: marketOverview.status === 'fulfilled'
        ? (marketOverview.value as AIAnalysisRequest['marketOverview'])
        : null,
      fundingRate: fundingRate.status === 'fulfilled' ? fundingRate.value : null,
      news: [],
    };

    const result = await runAIAnalysis(analysisReq);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
