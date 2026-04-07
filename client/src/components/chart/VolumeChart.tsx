import { useEffect, useRef } from 'react';
import { createChart, type IChartApi, ColorType } from 'lightweight-charts';
import type { Candle } from '@/types';
import { CHART_COLORS } from '@/constants';

interface Props {
  candles: Candle[];
  height?: number;
}

export function VolumeChart({ candles, height = 100 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

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
      rightPriceScale: { borderColor: '#2A3F74' },
      timeScale: { borderColor: '#2A3F74', timeVisible: true },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

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
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return;

    const volSeries = chartRef.current.addHistogramSeries({
      color: CHART_COLORS.volumeUp,
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0 } });

    volSeries.setData(
      candles.map((c) => ({
        time: c.time as number,
        value: c.volume,
        color: c.close >= c.open ? CHART_COLORS.volumeUp : CHART_COLORS.volumeDown,
      })) as Parameters<typeof volSeries.setData>[0]
    );

    chartRef.current.timeScale().fitContent();
  }, [candles]);

  return <div ref={containerRef} className="w-full" style={{ height: `${height}px` }} />;
}
