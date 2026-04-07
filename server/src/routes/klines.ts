import { Router, Request, Response, NextFunction } from 'express';
import { getKlines } from '../services/binanceService';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbol = 'BTCUSDT', interval = '1m', limit = '500' } = req.query;
    const data = await getKlines(
      String(symbol).toUpperCase(),
      String(interval),
      Math.min(parseInt(String(limit)), 1000)
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
