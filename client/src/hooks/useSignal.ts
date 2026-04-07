import { useEffect, useRef } from 'react';
import { useChartStore } from '@/stores/useChartStore';
import { useIndicatorStore } from '@/stores/useIndicatorStore';
import { useSignalStore } from '@/stores/useSignalStore';
import { useAlertStore } from '@/stores/useAlertStore';
import { generateSignal } from '@/engine/signalEngine';
import { detectSRLevels } from '@/engine/supportResistance';
import type { SignalType } from '@/types';

const STRONG_SIGNALS: SignalType[] = ['STRONG_BUY', 'STRONG_SELL'];

export function useSignal() {
  const { candles, symbol } = useChartStore();
  const { indicators } = useIndicatorStore();
  const { setSignal, signal: prevSignal } = useSignalStore();
  const { addAlert } = useAlertStore();
  const prevTypeRef = useRef<SignalType | null>(null);

  useEffect(() => {
    prevTypeRef.current = null;
  }, [symbol]);

  useEffect(() => {
    if (!indicators || candles.length === 0) return;

    // Only run on closed candles to avoid noise (or always run — UI handles it)
    const srLevels = detectSRLevels(candles);
    const signal = generateSignal(candles, indicators, srLevels);

    if (!signal) return;
    setSignal(signal);

    // Browser notification on STRONG signal transition
    const isNewStrong = STRONG_SIGNALS.includes(signal.type) && signal.type !== prevTypeRef.current;
    if (isNewStrong) {
      const lastClose = candles[candles.length - 1].close;

      // Store alert
      addAlert({
        id: `${Date.now()}-${symbol}`,
        symbol,
        signal: signal.type as 'STRONG_BUY' | 'STRONG_SELL',
        price: lastClose,
        timestamp: Date.now(),
        read: false,
      });

      // Browser notification
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(`Crypto Signal: ${signal.type.replace('_', ' ')}`, {
          body: `${symbol} @ $${lastClose.toFixed(2)} | Score: ${signal.score > 0 ? '+' : ''}${signal.score}`,
          icon: '/vite.svg',
        });
      }
    }

    prevTypeRef.current = signal.type;
  }, [candles, indicators, symbol, setSignal, addAlert]);
}
