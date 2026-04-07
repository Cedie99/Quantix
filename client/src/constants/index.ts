import type { TimeframeConfig, SignalType } from '@/types';

// ─── Timeframes ───────────────────────────────────────────────────────────────
export const TIMEFRAMES: TimeframeConfig[] = [
  { label: '1m', value: '1m', wsInterval: '1m', candlesNeeded: 210 },
  { label: '5m', value: '5m', wsInterval: '5m', candlesNeeded: 210 },
  { label: '15m', value: '15m', wsInterval: '15m', candlesNeeded: 210 },
  { label: '1h', value: '1h', wsInterval: '1h', candlesNeeded: 210 },
  { label: '4h', value: '4h', wsInterval: '4h', candlesNeeded: 210 },
  { label: '1d', value: '1d', wsInterval: '1d', candlesNeeded: 210 },
];

// ─── Signal Thresholds ────────────────────────────────────────────────────────
export const SIGNAL_THRESHOLDS = {
  STRONG_BUY: 62,   // requires ~4 of 8 indicators strongly agreeing
  BUY: 25,
  SELL: -25,
  STRONG_SELL: -62,
} as const;

// ─── Signal Colors ────────────────────────────────────────────────────────────
export const SIGNAL_COLORS: Record<SignalType, string> = {
  STRONG_BUY: '#16a34a',
  BUY: '#22c55e',
  NEUTRAL: '#f59e0b',
  SELL: '#ef4444',
  STRONG_SELL: '#b91c1c',
};

export const SIGNAL_BG_COLORS: Record<SignalType, string> = {
  STRONG_BUY: 'bg-green-100 border-green-300',
  BUY: 'bg-emerald-100 border-emerald-300',
  NEUTRAL: 'bg-amber-100 border-amber-300',
  SELL: 'bg-red-100 border-red-300',
  STRONG_SELL: 'bg-rose-100 border-rose-300',
};

export const SIGNAL_TEXT_COLORS: Record<SignalType, string> = {
  STRONG_BUY: 'text-green-800',
  BUY: 'text-emerald-800',
  NEUTRAL: 'text-amber-800',
  SELL: 'text-red-700',
  STRONG_SELL: 'text-rose-800',
};

export const SIGNAL_LABELS: Record<SignalType, string> = {
  STRONG_BUY: 'STRONG BUY',
  BUY: 'BUY',
  NEUTRAL: 'NEUTRAL',
  SELL: 'SELL',
  STRONG_SELL: 'STRONG SELL',
};

// ─── Indicator Minimums ───────────────────────────────────────────────────────
export const INDICATOR_MIN_CANDLES = {
  RSI: 29,        // 2*period+1 for warmed Wilder smoothing (period=14)
  MACD: 34,       // slowPeriod(26) + signalPeriod(9) - 1
  BB: 21,
  EMA9: 10,
  EMA21: 22,
  EMA50: 51,
  EMA200: 201,
  STOCHASTIC: 15,
  ATR: 15,
  VOLUME_SMA: 20, // matches SMA period of 20
} as const;

// ─── Voter Weights ────────────────────────────────────────────────────────────
// Total max weight = 13.5 (excluding Volume which acts as a multiplier)
export const VOTER_WEIGHTS = {
  RSI: 2.0,
  MACD: 2.5,
  EMA: 2.5,       // raised — primary trend filter
  BOLLINGER: 1.5,
  STOCHASTIC: 1.5,
  VOLUME: 1.5,    // used for UI display; acts as multiplier in engine
  SR: 1.5,        // raised — S/R confluence is a strong signal
  MOMENTUM: 1.5,  // new — price rate of change
} as const;

// ─── Chart Colors ─────────────────────────────────────────────────────────────
export const CHART_COLORS = {
  upCandle: '#22c55e',
  downCandle: '#ef4444',
  ema9: '#60a5fa',
  ema21: '#f59e0b',
  ema50: '#a78bfa',
  ema200: '#f97316',
  bbUpper: '#64748b',
  bbMiddle: '#475569',
  bbLower: '#64748b',
  volume: '#334155',
  volumeUp: '#16a34a',
  volumeDown: '#dc2626',
  rsi: '#60a5fa',
  macdLine: '#60a5fa',
  macdSignal: '#f97316',
  macdHistogramPos: '#22c55e',
  macdHistogramNeg: '#ef4444',
  stochK: '#60a5fa',
  stochD: '#f97316',
  support: '#22c55e',
  resistance: '#ef4444',
} as const;

// ─── Risk Management Defaults ────────────────────────────────────────────────
export const RISK_DEFAULTS = {
  accountSize: 10000,
  riskPercent: 1,
  atrMultiplier: 1.5,
} as const;

// ─── Default Watchlist ────────────────────────────────────────────────────────
export const DEFAULT_WATCHLIST = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];

// ─── API Base ─────────────────────────────────────────────────────────────────
export const API_BASE = '/api';
export const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';
export const MAX_CANDLES = 500;
