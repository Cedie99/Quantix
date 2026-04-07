import { useEffect, useRef } from 'react';
import { useMarketStore } from '@/stores/useMarketStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { fetchMarketOverview, fetchTopMovers } from '@/services/api/coinGecko';
import { fetchTicker24hr } from '@/services/api/binanceRest';

const MARKET_REFRESH_MS = 60_000;
const TICKER_REFRESH_MS = 15_000;

export function useMarket() {
  const { setOverview, setMovers } = useMarketStore();
  const { items, updatePrice } = useWatchlistStore();

  // Use refs so interval callbacks always see the latest values
  // without making them dependencies (prevents cascade re-runs on every price update)
  const itemsRef = useRef(items);
  const updatePriceRef = useRef(updatePrice);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { updatePriceRef.current = updatePrice; }, [updatePrice]);

  // Market overview (BTC dom, F&G, etc.)
  useEffect(() => {
    const load = () => {
      fetchMarketOverview().then(setOverview).catch(() => {});
      fetchTopMovers().then(setMovers).catch(() => {});
    };
    load();
    const id = setInterval(load, MARKET_REFRESH_MS);
    return () => clearInterval(id);
  }, [setOverview, setMovers]);

  // Watchlist ticker prices — single stable interval, no cascade on price updates
  useEffect(() => {
    const load = () => {
      itemsRef.current.forEach(({ symbol }) => {
        fetchTicker24hr(symbol)
          .then((data) => {
            updatePriceRef.current(symbol, parseFloat(data.lastPrice), parseFloat(data.priceChangePercent));
          })
          .catch(() => {});
      });
    };
    load();
    const id = setInterval(load, TICKER_REFRESH_MS);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
