import type { Candle } from '@/types';
import { BINANCE_WS_BASE } from '@/constants';

type OnCandleCallback = (candle: Candle) => void;

interface KlineEvent {
  k: {
    t: number;  // kline start time ms
    o: string;
    h: string;
    l: string;
    c: string;
    v: string;
    x: boolean; // is kline closed
  };
}

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

export class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private symbol: string;
  private interval: string;
  private onCandle: OnCandleCallback;
  private reconnectAttempt = 0;
  private shouldReconnect = true;
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  constructor(symbol: string, interval: string, onCandle: OnCandleCallback) {
    this.symbol = symbol.toLowerCase();
    this.interval = interval;
    this.onCandle = onCandle;
  }

  connect(): void {
    const url = `${BINANCE_WS_BASE}/${this.symbol}@kline_${this.interval}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log(`[WS] Connected: ${this.symbol}@${this.interval}`);
      this.reconnectAttempt = 0;
      this.startPing();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as KlineEvent;
        if (!data.k) return;
        const k = data.k;
        const candle: Candle = {
          time: Math.floor(k.t / 1000),
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
          isClosed: k.x,
        };
        this.onCandle(candle);
      } catch (err) {
        console.warn('[WS] Parse error', err);
      }
    };

    this.ws.onerror = (err) => {
      console.warn('[WS] Error', err);
    };

    this.ws.onclose = () => {
      console.log('[WS] Closed');
      this.stopPing();
      if (this.shouldReconnect) {
        const delay = RECONNECT_DELAYS[Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1)];
        this.reconnectAttempt++;
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt})...`);
        setTimeout(() => this.connect(), delay);
      }
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  updateStream(symbol: string, interval: string): void {
    this.symbol = symbol.toLowerCase();
    this.interval = interval;
    this.shouldReconnect = true;
    this.reconnectAttempt = 0;
    this.disconnect();
    this.shouldReconnect = true;
    this.connect();
  }

  private startPing(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: 'ping' }));
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}
