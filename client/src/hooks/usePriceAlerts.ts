import { useEffect, useRef } from 'react';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useChartStore } from '@/stores/useChartStore';
import { usePriceAlertStore } from '@/stores/usePriceAlertStore';

export function usePriceAlerts() {
  const items = useWatchlistStore((s) => s.items);
  const candles = useChartStore((s) => s.candles);
  const symbol = useChartStore((s) => s.symbol);
  const { priceAlerts, triggerPriceAlert } = usePriceAlertStore();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Build prices map from watchlist items
    const prices: Record<string, number> = {};
    for (const item of items) {
      if (item.price) prices[item.symbol] = item.price;
    }

    // Also include the last candle close for current symbol
    if (candles.length > 0) {
      prices[symbol] = candles[candles.length - 1].close;
    }

    const activeAlerts = priceAlerts.filter((a) => a.active);

    for (const alert of activeAlerts) {
      const currentPrice = prices[alert.symbol];
      if (currentPrice === undefined) continue;

      const triggered =
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (triggered && !notifiedRef.current.has(alert.id)) {
        notifiedRef.current.add(alert.id);
        triggerPriceAlert(alert.id, Date.now());

        // Browser notification
        const direction = alert.condition === 'above' ? '▲' : '▼';
        const msg = `${alert.symbol.replace('USDT', '')} ${direction} $${alert.targetPrice.toLocaleString()}`;

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Quantix Price Alert', { body: msg, icon: '/favicon.ico' });
        } else if (typeof Notification !== 'undefined' && Notification.permission !== 'denied') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') new Notification('Quantix Price Alert', { body: msg, icon: '/favicon.ico' });
          });
        }
      }
    }
  }, [items, candles, symbol, priceAlerts, triggerPriceAlert]);
}
