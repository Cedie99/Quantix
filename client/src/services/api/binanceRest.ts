import { httpClient } from './httpClient';
import type { Candle, ExchangeSymbol } from '@/types';

export async function fetchKlines(symbol: string, interval: string, limit = 500): Promise<Candle[]> {
  const { data } = await httpClient.get<Candle[]>('/klines', {
    params: { symbol, interval, limit },
  });
  return data;
}

export async function fetchTicker24hr(symbol: string) {
  const { data } = await httpClient.get(`/ticker/24hr`, { params: { symbol } });
  return data;
}

export async function fetchExchangeSymbols(): Promise<ExchangeSymbol[]> {
  const { data } = await httpClient.get<ExchangeSymbol[]>('/exchange/symbols');
  return data;
}
