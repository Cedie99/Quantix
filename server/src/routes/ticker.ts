import { Router, Request, Response, NextFunction } from 'express';
import { getTicker24hr } from '../services/binanceService';

const router = Router();

router.get('/24hr', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbol = 'BTCUSDT' } = req.query;
    const data = await getTicker24hr(String(symbol).toUpperCase());
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
