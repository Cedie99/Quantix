import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import klinesRouter from './routes/klines';
import tickerRouter from './routes/ticker';
import marketRouter from './routes/market';
import symbolsRouter from './routes/symbols';
import aiRouter from './routes/ai';
import authRouter from './routes/auth';
import userDataRouter from './routes/userData';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Rate limiter — global
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down.' },
  })
);

// Stricter rate limit for AI route (Claude calls are expensive)
const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI analysis rate limit exceeded, please wait.' },
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userDataRouter);
app.use('/api/klines', klinesRouter);
app.use('/api/ticker', tickerRouter);
app.use('/api/market', marketRouter);
app.use('/api/exchange/symbols', symbolsRouter);
app.use('/api/ai', aiLimiter, aiRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});

export default app;
