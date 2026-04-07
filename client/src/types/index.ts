// ─── Candle ──────────────────────────────────────────────────────────────────
export interface Candle {
  time: number; // Unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed?: boolean;
}

// ─── Indicators ──────────────────────────────────────────────────────────────
export interface MACDResult {
  MACD: number;
  signal: number;
  histogram: number;
}

export interface BollingerBandsResult {
  upper: number;
  middle: number;
  lower: number;
}

export interface StochasticResult {
  k: number;
  d: number;
}

export interface IndicatorSet {
  rsi: number | null;
  macd: MACDResult | null;
  bollingerBands: BollingerBandsResult | null;
  ema9: number | null;
  ema21: number | null;
  ema50: number | null;
  ema200: number | null;
  stochastic: StochasticResult | null;
  atr: number | null;
  volumeSMA: number | null;
}

// ─── Signal ───────────────────────────────────────────────────────────────────
export type SignalType = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface Vote {
  indicator: string;
  vote: -1 | 0 | 1;
  reason: string;
  weight: number;
}

export interface Signal {
  type: SignalType;
  score: number; // -100 to +100
  confidence: number; // 0-100
  votes: Vote[];
  indicators: IndicatorSet;
  timestamp: number;
}

// ─── Risk Management ──────────────────────────────────────────────────────────
export interface RiskManagement {
  entryPrice: number;
  stopLoss: number;
  takeProfit2R: number;
  takeProfit3R: number;
  stopDistance: number;
  positionSize: number; // coins
  positionSizeUSD: number;
  riskAmountUSD: number;
}

// ─── Market ───────────────────────────────────────────────────────────────────
export interface MarketOverview {
  btcDominance: number;
  ethDominance: number;
  totalMarketCap: number;
  totalVolume: number;
  marketCapChangePercentage24h: number;
  activeCryptocurrencies: number;
  fearGreed: FearGreedData | null;
}

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

export interface TopMover {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
}

export interface TopMovers {
  gainers: TopMover[];
  losers: TopMover[];
}

// ─── Watchlist ────────────────────────────────────────────────────────────────
export interface WatchlistItem {
  symbol: string;
  price?: number;
  change24h?: number;
}

// ─── Alert ───────────────────────────────────────────────────────────────────
export type AlertTrigger = 'STRONG_BUY' | 'STRONG_SELL';

export interface Alert {
  id: string;
  symbol: string;
  signal: AlertTrigger;
  price: number;
  timestamp: number;
  read: boolean;
}

// ─── AI Analysis ──────────────────────────────────────────────────────────────
export interface AIAnalysis {
  verdict: 'CONFIRM_BUY' | 'HOLD' | 'CONFIRM_SELL' | 'CAUTION' | 'STRONG_CAUTION';
  confidenceModifier: 'BOOST' | 'NEUTRAL' | 'REDUCE';
  keyInsight: string;
  risks: string[];
  contextSummary: string;
  timestamp: number;
}

// ─── Timeframe ────────────────────────────────────────────────────────────────
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface TimeframeConfig {
  label: string;
  value: Timeframe;
  wsInterval: string;
  candlesNeeded: number;
}

// ─── Support & Resistance ─────────────────────────────────────────────────────
export interface SRLevel {
  price: number;
  type: 'support' | 'resistance';
  strength: number;
}

// ─── Exchange Symbol ──────────────────────────────────────────────────────────
export interface ExchangeSymbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
}

// ─── Trade Journal ────────────────────────────────────────────────────────────
export interface Trade {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entry: number;
  stop: number;
  tp1: number;
  tp2?: number;
  qty: number;
  openedAt: number;
  closedAt?: number;
  closePrice?: number;
  status: 'open' | 'closed' | 'cancelled';
  pnl?: number;
  notes?: string;
}

// ─── Price Alert ──────────────────────────────────────────────────────────────
export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  active: boolean;
  createdAt: number;
  triggeredAt?: number;
}
