import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { pool } from '../db/pool';

const router = Router();
router.use(requireAuth);

// GET /api/user/data
router.get('/data', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  try {
    const [watchlistRes, riskRes, chartRes, alertsRes] = await Promise.all([
      pool.query('SELECT symbol FROM user_watchlist WHERE user_id = $1 ORDER BY id', [userId]),
      pool.query('SELECT account_size, risk_percent FROM user_risk_settings WHERE user_id = $1', [userId]),
      pool.query('SELECT symbol, timeframe FROM user_chart_prefs WHERE user_id = $1', [userId]),
      pool.query(
        'SELECT id, symbol, signal, price, triggered_at, read FROM user_alert_history WHERE user_id = $1 ORDER BY triggered_at DESC LIMIT 50',
        [userId]
      ),
    ]);

    res.json({
      watchlist: watchlistRes.rows.map((r) => r.symbol),
      riskSettings: riskRes.rows[0] ?? { account_size: 10000, risk_percent: 1.0 },
      chartPrefs: chartRes.rows[0] ?? { symbol: 'BTCUSDT', timeframe: '1m' },
      alertHistory: alertsRes.rows,
    });
  } catch (err) {
    console.error('[UserData] GET /data error', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// PUT /api/user/watchlist
router.put('/watchlist', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { symbols } = req.body as { symbols: string[] };

  if (!Array.isArray(symbols)) {
    res.status(400).json({ error: 'symbols must be an array' });
    return;
  }

  try {
    await pool.query('DELETE FROM user_watchlist WHERE user_id = $1', [userId]);
    if (symbols.length > 0) {
      const values = symbols
        .map((_, i) => `($1, $${i + 2})`)
        .join(', ');
      await pool.query(
        `INSERT INTO user_watchlist (user_id, symbol) VALUES ${values} ON CONFLICT DO NOTHING`,
        [userId, ...symbols]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('[UserData] PUT /watchlist error', err);
    res.status(500).json({ error: 'Failed to update watchlist' });
  }
});

// PUT /api/user/risk
router.put('/risk', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { accountSize, riskPercent } = req.body;

  if (accountSize == null || riskPercent == null) {
    res.status(400).json({ error: 'accountSize and riskPercent are required' });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO user_risk_settings (user_id, account_size, risk_percent, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET account_size = EXCLUDED.account_size,
             risk_percent = EXCLUDED.risk_percent,
             updated_at   = NOW()`,
      [userId, accountSize, riskPercent]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[UserData] PUT /risk error', err);
    res.status(500).json({ error: 'Failed to update risk settings' });
  }
});

// PUT /api/user/chart-prefs
router.put('/chart-prefs', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { symbol, timeframe } = req.body;

  if (!symbol || !timeframe) {
    res.status(400).json({ error: 'symbol and timeframe are required' });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO user_chart_prefs (user_id, symbol, timeframe, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET symbol    = EXCLUDED.symbol,
             timeframe = EXCLUDED.timeframe,
             updated_at = NOW()`,
      [userId, symbol, timeframe]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[UserData] PUT /chart-prefs error', err);
    res.status(500).json({ error: 'Failed to update chart preferences' });
  }
});

// POST /api/user/alerts
router.post('/alerts', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { symbol, signal, price, triggeredAt } = req.body;

  if (!symbol || !signal || price == null) {
    res.status(400).json({ error: 'symbol, signal, and price are required' });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO user_alert_history (user_id, symbol, signal, price, triggered_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, symbol, signal, price, triggeredAt ? new Date(triggeredAt) : new Date()]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[UserData] POST /alerts error', err);
    res.status(500).json({ error: 'Failed to save alert' });
  }
});

// PUT /api/user/alerts/read-all
router.put('/alerts/read-all', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  try {
    await pool.query(
      'UPDATE user_alert_history SET read = TRUE WHERE user_id = $1 AND read = FALSE',
      [userId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[UserData] PUT /alerts/read-all error', err);
    res.status(500).json({ error: 'Failed to mark alerts as read' });
  }
});

export default router;
