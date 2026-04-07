CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_watchlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol     TEXT NOT NULL,
  UNIQUE(user_id, symbol)
);

CREATE TABLE IF NOT EXISTS user_risk_settings (
  user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  account_size NUMERIC(18,2) NOT NULL DEFAULT 10000,
  risk_percent NUMERIC(5,2)  NOT NULL DEFAULT 1.0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_chart_prefs (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  symbol     TEXT NOT NULL DEFAULT 'BTCUSDT',
  timeframe  TEXT NOT NULL DEFAULT '1m',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_alert_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol       TEXT NOT NULL,
  signal       TEXT NOT NULL,
  price        NUMERIC(18,8) NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read         BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON user_alert_history(user_id, triggered_at DESC);
