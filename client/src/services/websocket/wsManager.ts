import { BinanceWebSocket } from './BinanceWebSocket';
import type { Candle } from '@/types';

let instance: BinanceWebSocket | null = null;

export const wsManager = {
  connect(symbol: string, interval: string, onCandle: (candle: Candle) => void): void {
    if (instance) instance.disconnect();
    instance = new BinanceWebSocket(symbol, interval, onCandle);
    instance.connect();
  },

  update(symbol: string, interval: string, onCandle: (candle: Candle) => void): void {
    if (!instance) {
      this.connect(symbol, interval, onCandle);
      return;
    }
    instance.disconnect();
    instance = new BinanceWebSocket(symbol, interval, onCandle);
    instance.connect();
  },

  disconnect(): void {
    if (instance) {
      instance.disconnect();
      instance = null;
    }
  },
};
