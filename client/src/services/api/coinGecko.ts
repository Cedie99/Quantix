import { httpClient } from './httpClient';
import type { MarketOverview, TopMovers } from '@/types';

export async function fetchMarketOverview(): Promise<MarketOverview> {
  const { data } = await httpClient.get<MarketOverview>('/market/overview');
  return data;
}

export async function fetchTopMovers(): Promise<TopMovers> {
  const { data } = await httpClient.get<TopMovers>('/market/movers');
  return data;
}
