import { Router, Request, Response, NextFunction } from 'express';
import { getExchangeSymbols } from '../services/binanceService';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getExchangeSymbols();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
