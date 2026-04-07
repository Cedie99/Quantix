import { Router, Request, Response, NextFunction } from 'express';
import { getMarketOverview, getTopMovers, getFearGreedIndex } from '../services/coinGeckoService';

const router = Router();

router.get('/overview', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [overview, fearGreed] = await Promise.all([getMarketOverview(), getFearGreedIndex()]);
    res.json({ ...overview, fearGreed });
  } catch (err) {
    next(err);
  }
});

router.get('/movers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getTopMovers();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
