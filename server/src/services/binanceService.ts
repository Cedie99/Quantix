import axios from '../lib/axiosInstance';
import { cacheService } from './cacheService';

// Switched from Binance/Bybit (both blocked by PLDT/Smart in PH) to Gate.io V4 REST API.
// Function signatures and response shapes are unchanged — client code is unaffected.

const GATE_BASE = 'https://api.gateio.ws/api/v4';

// Gate.io candlestick array layout:
// [0] timestamp(s)  [1] quote_vol  [2] close  [3] high  [4] low  [5] open  [6] base_vol  [7] is_closed

// Convert Binance-style symbol (BTCUSDT) to Gate.io pair (BTC_USDT)
function toGatePair(symbol: string): string {
  return symbol.endsWith('USDT') ? `${symbol.slice(0, -4)}_USDT` : symbol;
}

export async function getKlines(symbol: string, interval: string, limit = 500) {
  const key = `klines:${symbol}:${interval}:${limit}`;
  const cached = cacheService.get(key);
  if (cached) return cached;

  const { data } = await axios.get(`${GATE_BASE}/spot/candlesticks`, {
    params: { currency_pair: toGatePair(symbol), interval, limit },
    timeout: 10000,
  });

  if (!Array.isArray(data)) {
    throw new Error(`Gate.io klines returned unexpected response: ${JSON.stringify(data)}`);
  }

  const candles = data.map((k: string[]) => ({
    time: parseInt(k[0]),
    open: parseFloat(k[5]),
    high: parseFloat(k[3]),
    low: parseFloat(k[4]),
    close: parseFloat(k[2]),
    volume: parseFloat(k[6]),
  }));

  cacheService.set(key, candles, 30_000);
  return candles;
}

export async function getTicker24hr(symbol: string) {
  const key = `ticker24hr:${symbol}`;
  const cached = cacheService.get(key);
  if (cached) return cached;

  const { data } = await axios.get(`${GATE_BASE}/spot/tickers`, {
    params: { currency_pair: toGatePair(symbol) },
    timeout: 10000,
  });

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Gate.io ticker returned unexpected response: ${JSON.stringify(data)}`);
  }

  const item = data[0];

  // Normalize to the same field names the client expects (Binance-compatible):
  // change_percentage from Gate.io is already in percent (e.g. "-2.2" = -2.2%)
  const ticker = {
    lastPrice: item.last,
    priceChangePercent: item.change_percentage,
    highPrice: item.high_24h,
    lowPrice: item.low_24h,
    volume: item.base_volume,
    quoteVolume: item.quote_volume,
  };

  cacheService.set(key, ticker, 10_000);
  return ticker;
}

export async function getExchangeSymbols() {
  const key = 'exchangeSymbols';
  const cached = cacheService.get(key);
  if (cached) return cached;

  const { data } = await axios.get(`${GATE_BASE}/spot/currency_pairs`, {
    timeout: 15000,
  });

  if (!Array.isArray(data)) {
    throw new Error(`Gate.io currency pairs returned unexpected response: ${JSON.stringify(data)}`);
  }

  const symbols = (data as { id: string; base: string; quote: string; trade_status: string }[])
    .filter((s) => s.quote === 'USDT' && s.trade_status === 'tradable')
    .map((s) => ({
      symbol: `${s.base}USDT`,  // normalize back to Binance-style (BTCUSDT)
      baseAsset: s.base,
      quoteAsset: s.quote,
    }));

  cacheService.set(key, symbols, 3_600_000);
  return symbols;
}

export async function getFundingRate(symbol: string): Promise<number | null> {
  const key = `funding:${symbol}`;
  const cached = cacheService.get<number>(key);
  if (cached !== null) return cached;

  try {
    const { data } = await axios.get(`${GATE_BASE}/futures/usdt/funding_rate`, {
      params: { contract: toGatePair(symbol), limit: 1 },
      timeout: 5000,
    });

    const rate = parseFloat(data[0]?.r ?? '0');
    cacheService.set(key, rate, 60_000);
    return rate;
  } catch {
    return null; // not all spot symbols have a futures contract
  }
}
