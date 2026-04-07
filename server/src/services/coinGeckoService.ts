import axios from '../lib/axiosInstance';
import { cacheService } from './cacheService';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export async function getMarketOverview() {
  const key = 'marketOverview';
  const cached = cacheService.get(key);
  if (cached) return cached;

  const { data } = await axios.get(`${COINGECKO_BASE}/global`, { timeout: 10000 });
  const result = {
    btcDominance: data.data.market_cap_percentage?.btc ?? 0,
    ethDominance: data.data.market_cap_percentage?.eth ?? 0,
    totalMarketCap: data.data.total_market_cap?.usd ?? 0,
    totalVolume: data.data.total_volume?.usd ?? 0,
    marketCapChangePercentage24h: data.data.market_cap_change_percentage_24h_usd ?? 0,
    activeCryptocurrencies: data.data.active_cryptocurrencies ?? 0,
  };

  cacheService.set(key, result, 60_000);
  return result;
}

export async function getTopMovers() {
  const key = 'topMovers';
  const cached = cacheService.get(key);
  if (cached) return cached;

  const { data } = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 50,
      page: 1,
      price_change_percentage: '24h',
    },
    timeout: 10000,
  });

  if (!Array.isArray(data)) {
    throw new Error(`CoinGecko markets returned unexpected response: ${JSON.stringify(data)}`);
  }

  const sorted = [...data].sort(
    (a: { price_change_percentage_24h: number }, b: { price_change_percentage_24h: number }) =>
      b.price_change_percentage_24h - a.price_change_percentage_24h
  );

  const result = {
    gainers: sorted.slice(0, 5).map(formatCoin),
    losers: sorted.slice(-5).reverse().map(formatCoin),
  };

  cacheService.set(key, result, 30_000);
  return result;
}

export async function getFearGreedIndex() {
  const key = 'fearGreed';
  const cached = cacheService.get(key);
  if (cached) return cached;

  const { data } = await axios.get('https://api.alternative.me/fng/', { timeout: 10000 });
  const result = {
    value: parseInt(data.data[0].value),
    classification: data.data[0].value_classification,
    timestamp: data.data[0].timestamp,
  };

  cacheService.set(key, result, 3_600_000);
  return result;
}

function formatCoin(coin: {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}) {
  return {
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    change24h: coin.price_change_percentage_24h,
    marketCap: coin.market_cap,
  };
}
