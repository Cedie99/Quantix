import { useEffect, useRef } from 'react';
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickSeriesOptions,
  type LineSeriesOptions,
  ColorType,
} from 'lightweight-charts';
import type { Candle, IndicatorSet, SRLevel } from '@/types';
import { CHART_COLORS } from '@/constants';
import { calculateEMA9Series, calculateEMA21Series, calculateEMA50Series, calculateEMA200Series } from '@/services/indicators/ema';
import { calculateBollingerBandsSeries } from '@/services/indicators/bollingerBands';
import { extractCloses } from '@/utils/candles';

interface SignalMarker {
  time: number; // ms
  type: 'STRONG_BUY' | 'STRONG_SELL';
  price: number;
}

interface Props {
  candles: Candle[];
  indicators: IndicatorSet | null;
  srLevels: SRLevel[];
  height?: number;
  signalMarkers?: SignalMarker[];
}

export function CandlestickChart({ candles, indicators, srLevels, height = 400, signalMarkers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const overlaySeriesRef = useRef<ISeriesApi<'Line'>[]>([]);

  // Track first candle time to distinguish new datasets from live WS updates
  const prevCandleFirstTimeRef = useRef<number>(0);
  const prevOverlayFirstTimeRef = useRef<number>(0);

  // Create chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f1630' },
        textColor: '#8fa4d6',
      },
      grid: {
        vertLines: { color: '#1a2751' },
        horzLines: { color: '#1a2751' },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#2A3F74' },
      timeScale: { borderColor: '#2A3F74', timeVisible: true, secondsVisible: false },
      handleScroll: true,
      handleScale: true,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: CHART_COLORS.upCandle,
      downColor: CHART_COLORS.downCandle,
      borderUpColor: CHART_COLORS.upCandle,
      borderDownColor: CHART_COLORS.downCandle,
      wickUpColor: CHART_COLORS.upCandle,
      wickDownColor: CHART_COLORS.downCandle,
    } as Partial<CandlestickSeriesOptions>);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      overlaySeriesRef.current = [];
      prevCandleFirstTimeRef.current = 0;
      prevOverlayFirstTimeRef.current = 0;
    };
  }, []);

  // Update candle series
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    const firstTime = candles[0].time as number;
    const isNewDataset = firstTime !== prevCandleFirstTimeRef.current;

    if (isNewDataset) {
      // Full historical load or symbol/timeframe switch — replace all data and fit
      const chartData = candles.map((c) => ({
        time: c.time as number,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      candleSeriesRef.current.setData(chartData as Parameters<typeof candleSeriesRef.current.setData>[0]);
      chartRef.current?.timeScale().fitContent();
      prevCandleFirstTimeRef.current = firstTime;
    } else {
      // Live WebSocket update — only update the last candle, preserve scroll position
      const last = candles[candles.length - 1];
      candleSeriesRef.current.update({
        time: last.time as number,
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
      } as Parameters<typeof candleSeriesRef.current.update>[0]);
    }
  }, [candles]);

  // Update EMA + BB overlays — only on new dataset, not on every WS tick
  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return;

    const firstTime = candles[0].time as number;
    if (firstTime === prevOverlayFirstTimeRef.current) return; // skip WS ticks
    prevOverlayFirstTimeRef.current = firstTime;

    // Remove old overlay series before adding new ones
    overlaySeriesRef.current.forEach((s) => {
      try { chartRef.current!.removeSeries(s); } catch { /* already removed */ }
    });
    overlaySeriesRef.current = [];

    const closes = extractCloses(candles);
    const times = candles.map((c) => c.time);

    const addLineSeries = (values: number[], color: string, lineWidth = 1) => {
      if (!chartRef.current || values.length === 0) return null;
      const offset = times.length - values.length;
      const series = chartRef.current.addLineSeries({
        color,
        lineWidth,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      } as Partial<LineSeriesOptions>);
      series.setData(
        values.map((v, i) => ({ time: times[offset + i] as number, value: v })) as Parameters<typeof series.setData>[0]
      );
      return series;
    };

    const ema9 = calculateEMA9Series(closes);
    const ema21 = calculateEMA21Series(closes);
    const ema50 = calculateEMA50Series(closes);
    const ema200 = calculateEMA200Series(closes);
    const bb = calculateBollingerBandsSeries(closes);

    const newSeries: ISeriesApi<'Line'>[] = [];

    const s1 = addLineSeries(ema9, CHART_COLORS.ema9);
    const s2 = addLineSeries(ema21, CHART_COLORS.ema21);
    const s3 = addLineSeries(ema50, CHART_COLORS.ema50, 1);
    const s4 = addLineSeries(ema200, CHART_COLORS.ema200, 2);
    [s1, s2, s3, s4].forEach((s) => s && newSeries.push(s));

    if (bb.length > 0) {
      const offset = times.length - bb.length;
      const bbUpper = chartRef.current.addLineSeries({
        color: CHART_COLORS.bbUpper,
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      } as Partial<LineSeriesOptions>);
      bbUpper.setData(bb.map((b, i) => ({ time: times[offset + i] as number, value: b.upper })) as Parameters<typeof bbUpper.setData>[0]);

      const bbLower = chartRef.current.addLineSeries({
        color: CHART_COLORS.bbLower,
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      } as Partial<LineSeriesOptions>);
      bbLower.setData(bb.map((b, i) => ({ time: times[offset + i] as number, value: b.lower })) as Parameters<typeof bbLower.setData>[0]);

      newSeries.push(bbUpper, bbLower);
    }

    overlaySeriesRef.current = newSeries;
  }, [candles]);

  // Update signal markers on chart
  useEffect(() => {
    if (!candleSeriesRef.current) return;
    if (!signalMarkers?.length) {
      candleSeriesRef.current.setMarkers([]);
      return;
    }
    const markers = signalMarkers
      .map((m) => ({
        time: Math.floor(m.time / 1000) as ReturnType<typeof Math.floor>,
        position: m.type === 'STRONG_BUY' ? 'belowBar' : 'aboveBar',
        color: m.type === 'STRONG_BUY' ? '#22c55e' : '#ef4444',
        shape: m.type === 'STRONG_BUY' ? 'arrowUp' : 'arrowDown',
        text: m.type === 'STRONG_BUY' ? 'SB' : 'SS',
        size: 1,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));
    // @ts-ignore — lightweight-charts setMarkers accepts this shape
    candleSeriesRef.current.setMarkers(markers);
  }, [signalMarkers]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  );
}
