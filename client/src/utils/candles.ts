import type { Candle } from '@/types';
import { MAX_CANDLES } from '@/constants';

/** Append/update a candle in the ring buffer (capped at MAX_CANDLES) */
export function appendCandle(candles: Candle[], newCandle: Candle): Candle[] {
  const buf = [...candles];
  const lastIdx = buf.findIndex((c) => c.time === newCandle.time);

  if (lastIdx >= 0) {
    // Update existing candle (e.g. live WebSocket update for unclosed candle)
    buf[lastIdx] = newCandle;
  } else {
    buf.push(newCandle);
    if (buf.length > MAX_CANDLES) buf.shift(); // Ring buffer
  }
  return buf;
}

export function extractCloses(candles: Candle[]): number[] {
  return candles.map((c) => c.close);
}

export function extractHighs(candles: Candle[]): number[] {
  return candles.map((c) => c.high);
}

export function extractLows(candles: Candle[]): number[] {
  return candles.map((c) => c.low);
}

export function extractVolumes(candles: Candle[]): number[] {
  return candles.map((c) => c.volume);
}

export function extractOHLC(candles: Candle[]) {
  return {
    open: candles.map((c) => c.open),
    high: candles.map((c) => c.high),
    low: candles.map((c) => c.low),
    close: candles.map((c) => c.close),
  };
}
