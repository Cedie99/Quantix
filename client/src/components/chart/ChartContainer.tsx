import { useRef, useState, useEffect, useMemo } from 'react';
import { useChartStore } from '@/stores/useChartStore';
import { useIndicatorStore } from '@/stores/useIndicatorStore';
import { useAlertStore } from '@/stores/useAlertStore';
import { CandlestickChart } from './CandlestickChart';
import { VolumeChart } from './VolumeChart';
import { IndicatorChart } from './IndicatorChart';
import { detectSRLevels } from '@/engine/supportResistance';

const VOLUME_HEIGHT = 70;
const INDICATOR_HEIGHT = 130;

export function ChartContainer() {
  const { candles, isLoading, error, symbol } = useChartStore();
  const { indicators } = useIndicatorStore();
  const { alerts } = useAlertStore();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [candleHeight, setCandleHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const volumeHeight = isMobile ? 54 : VOLUME_HEIGHT;
  const indicatorHeight = isMobile ? 96 : INDICATOR_HEIGHT;

  // ResizeObserver to track available height for the candle chart
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const total = entries[0].contentRect.height;
      setCandleHeight(Math.max(0, total - volumeHeight - indicatorHeight));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [volumeHeight, indicatorHeight]);

  const srLevels = useMemo(() => detectSRLevels(candles), [candles]);

  // Build signal markers from alert history (STRONG_BUY / STRONG_SELL only)
  const signalMarkers = useMemo(() => {
    return alerts
      .filter((a) => a.symbol === symbol && (a.signal === 'STRONG_BUY' || a.signal === 'STRONG_SELL'))
      .map((a) => ({ time: a.timestamp, type: a.signal as 'STRONG_BUY' | 'STRONG_SELL', price: a.price }));
  }, [alerts, symbol]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2A3F74] border-t-[#5B7BFF] rounded-full animate-spin" />
          <span className="text-sm">Loading chart data…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        <p className="text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="flex flex-col h-full overflow-hidden">
      {/* Candlestick — dynamic flex-1 via ResizeObserver */}
      <div className="flex-1 min-h-0">
        {candleHeight > 0 && (
          <CandlestickChart
            candles={candles}
            indicators={indicators}
            srLevels={srLevels}
            height={candleHeight}
            signalMarkers={signalMarkers}
          />
        )}
      </div>

      {/* Volume */}
      <div className="shrink-0 border-t" style={{ borderColor: '#2A3F74' }}>
        <VolumeChart candles={candles} height={volumeHeight} />
      </div>

      {/* MACD / RSI */}
      <div className="shrink-0 border-t" style={{ borderColor: '#2A3F74' }}>
        <IndicatorChart candles={candles} height={indicatorHeight} />
      </div>
    </div>
  );
}
