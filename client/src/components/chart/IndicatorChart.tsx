import { useEffect, useRef, useState } from 'react';
import { createChart, type IChartApi, ColorType } from 'lightweight-charts';
import type { Candle } from '@/types';
import { CHART_COLORS } from '@/constants';
import { calculateRSISeries } from '@/services/indicators/rsi';
import { calculateMACDSeries } from '@/services/indicators/macd';
import { calculateStochasticSeries } from '@/services/indicators/stochastic';
import { extractCloses, extractHighs, extractLows } from '@/utils/candles';
import { cn } from '@/utils/cn';

type ActiveIndicator = 'RSI' | 'MACD' | 'Stochastic';

interface Props {
  candles: Candle[];
  height?: number;
}

export function IndicatorChart({ candles, height = 180 }: Props) {
  const [active, setActive] = useState<ActiveIndicator>('RSI');
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
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
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

    const chart = chartRef.current;
    const closes = extractCloses(candles);
    const highs = extractHighs(candles);
    const lows = extractLows(candles);
    const times = candles.map((c) => c.time);

    // Remove all series (recreate)
    // lightweight-charts v4: remove all series by removing and re-creating chart is complex
    // Instead we track and remove series individually
    const seriesToRemove = (chart as unknown as { _private__seriesMap?: Map<unknown, unknown> });

    if (active === 'RSI') {
      const rsiValues = calculateRSISeries(closes);
      if (rsiValues.length > 0) {
        const offset = times.length - rsiValues.length;
        const rsiSeries = chart.addLineSeries({ color: CHART_COLORS.rsi, lineWidth: 2, priceLineVisible: false, lastValueVisible: true });
        rsiSeries.setData(rsiValues.map((v, i) => ({ time: times[offset + i] as number, value: v })) as Parameters<typeof rsiSeries.setData>[0]);

        // Overbought/oversold lines
        const obLine = chart.addLineSeries({ color: '#ef4444', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
        obLine.setData([{ time: times[0] as number, value: 70 }, { time: times[times.length - 1] as number, value: 70 }] as Parameters<typeof obLine.setData>[0]);
        const osLine = chart.addLineSeries({ color: '#22c55e', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
        osLine.setData([{ time: times[0] as number, value: 30 }, { time: times[times.length - 1] as number, value: 30 }] as Parameters<typeof osLine.setData>[0]);
      }
    } else if (active === 'MACD') {
      const macdSeries = calculateMACDSeries(closes);
      if (macdSeries.length > 0) {
        const offset = times.length - macdSeries.length;
        const macdLine = chart.addLineSeries({ color: CHART_COLORS.macdLine, lineWidth: 2, priceLineVisible: false, lastValueVisible: true });
        macdLine.setData(macdSeries.map((m, i) => ({ time: times[offset + i] as number, value: m.MACD })) as Parameters<typeof macdLine.setData>[0]);
        const signalLine = chart.addLineSeries({ color: CHART_COLORS.macdSignal, lineWidth: 1, priceLineVisible: false, lastValueVisible: true });
        signalLine.setData(macdSeries.map((m, i) => ({ time: times[offset + i] as number, value: m.signal })) as Parameters<typeof signalLine.setData>[0]);
        const hist = chart.addHistogramSeries({ priceLineVisible: false });
        hist.setData(macdSeries.map((m, i) => ({
          time: times[offset + i] as number,
          value: m.histogram,
          color: m.histogram >= 0 ? CHART_COLORS.macdHistogramPos : CHART_COLORS.macdHistogramNeg,
        })) as Parameters<typeof hist.setData>[0]);
      }
    } else if (active === 'Stochastic') {
      const stochSeries = calculateStochasticSeries(highs, lows, closes);
      if (stochSeries.length > 0) {
        const offset = times.length - stochSeries.length;
        const kLine = chart.addLineSeries({ color: CHART_COLORS.stochK, lineWidth: 2, priceLineVisible: false, lastValueVisible: true });
        kLine.setData(stochSeries.map((s, i) => ({ time: times[offset + i] as number, value: s.k })) as Parameters<typeof kLine.setData>[0]);
        const dLine = chart.addLineSeries({ color: CHART_COLORS.stochD, lineWidth: 1, priceLineVisible: false, lastValueVisible: true });
        dLine.setData(stochSeries.map((s, i) => ({ time: times[offset + i] as number, value: s.d })) as Parameters<typeof dLine.setData>[0]);
      }
    }

    chart.timeScale().fitContent();
  }, [candles, active]);

  const tabs: ActiveIndicator[] = ['RSI', 'MACD', 'Stochastic'];

  return (
    <div className="flex flex-col">
      <div className="flex gap-1 px-3 pt-2 pb-1" style={{ background: '#101a37', borderBottom: '1px solid #2A3F74' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              'px-2 py-0.5 text-xs rounded transition-colors',
              active === tab
                ? 'bg-blue-500 text-white'
                : 'text-slate-300 hover:text-slate-100 hover:bg-[#1A2550]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
}
