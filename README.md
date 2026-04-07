# Quantix

Real-time crypto trading signals with 8 weighted indicators, AI-assisted confirmation, risk management, and market overview.

## Quick Start

**Windows:** Double-click `start.bat`

**Manual:**

```bash
# Terminal 1 — Backend (port 3001)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open **http://localhost:5173**

## Features

- Real-time BTC/USDT candlestick chart (TradingView Lightweight Charts)
- 8 indicator voters: RSI, MACD, EMA 9/21/50/200, Bollinger Bands, Stochastic, Volume, Support/Resistance, Momentum
- Signal engine: STRONG BUY / BUY / NEUTRAL / SELL / STRONG SELL with score -100 to +100
- ATR-based stop-loss, 2R/3R take-profit, position sizing
- 6 timeframes: 1m, 5m, 15m, 1h, 4h, 1d
- Market overview: BTC dominance, Fear & Greed Index, top movers/losers
- Optional Claude AI confirmation layer for strong signals
- Browser notifications on STRONG BUY / STRONG SELL signal transitions
- Watchlist with quick symbol switching

## Stack

- Frontend: React 18 + Vite + TypeScript + TailwindCSS v4
- Backend: Node.js + Express + PostgreSQL (JWT auth, CORS proxy, in-memory cache)
- Data: Binance WebSocket (real-time) + Binance REST + CoinGecko + alternative.me

## Environment Variables

Core app functionality (charts, signals, market data) runs without paid API keys.

For AI confirmation, set:

```bash
ANTHROPIC_API_KEY=your_key_here
```
