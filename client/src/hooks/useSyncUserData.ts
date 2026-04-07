import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useRiskStore } from '@/stores/useRiskStore';
import { useChartStore } from '@/stores/useChartStore';
import { useAlertStore } from '@/stores/useAlertStore';
import { syncWatchlist, syncRisk, syncChartPrefs, saveAlert, markAlertsRead } from '@/services/api/authApi';

function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function useSyncUserData() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Track the last synced alert id to avoid double-posting
  const lastAlertIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // ── Watchlist (800ms debounce) ──────────────────────────────────────────
    const debouncedWatchlist = debounce((symbols: string[]) => {
      syncWatchlist(symbols).catch((e) => console.warn('[Sync] watchlist', e));
    }, 800);

    const unsubWatchlist = useWatchlistStore.subscribe(
      (s) => s.items.map((i) => i.symbol),
      (symbols) => debouncedWatchlist(symbols),
      { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
    );

    // ── Risk (1200ms debounce) ──────────────────────────────────────────────
    const debouncedRisk = debounce((accountSize: number, riskPercent: number) => {
      syncRisk(accountSize, riskPercent).catch((e) => console.warn('[Sync] risk', e));
    }, 1200);

    const unsubRisk = useRiskStore.subscribe(
      (s) => ({ accountSize: s.accountSize, riskPercent: s.riskPercent }),
      ({ accountSize, riskPercent }) => debouncedRisk(accountSize, riskPercent),
      { equalityFn: (a, b) => a.accountSize === b.accountSize && a.riskPercent === b.riskPercent }
    );

    // ── Chart prefs (500ms debounce) ────────────────────────────────────────
    const debouncedChart = debounce((symbol: string, timeframe: string) => {
      syncChartPrefs(symbol, timeframe).catch((e) => console.warn('[Sync] chart', e));
    }, 500);

    const unsubChart = useChartStore.subscribe(
      (s) => ({ symbol: s.symbol, timeframe: s.timeframe }),
      ({ symbol, timeframe }) => debouncedChart(symbol, timeframe),
      { equalityFn: (a, b) => a.symbol === b.symbol && a.timeframe === b.timeframe }
    );

    // ── New alert (immediate) ───────────────────────────────────────────────
    const unsubAlerts = useAlertStore.subscribe(
      (s) => s.alerts[0],
      (latestAlert) => {
        if (!latestAlert) return;
        if (latestAlert.id === lastAlertIdRef.current) return;
        lastAlertIdRef.current = latestAlert.id;
        saveAlert({
          symbol: latestAlert.symbol,
          signal: latestAlert.signal,
          price: latestAlert.price,
          triggeredAt: latestAlert.timestamp,
        }).catch((e) => console.warn('[Sync] alert', e));
      }
    );

    // ── Mark-all-read sync ──────────────────────────────────────────────────
    const unsubRead = useAlertStore.subscribe(
      (s) => s.unreadCount,
      (count, prev) => {
        if (count === 0 && prev > 0) {
          markAlertsRead().catch((e) => console.warn('[Sync] read-all', e));
        }
      }
    );

    return () => {
      unsubWatchlist();
      unsubRisk();
      unsubChart();
      unsubAlerts();
      unsubRead();
    };
  }, [isAuthenticated]);
}
