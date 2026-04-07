import { useIndicatorStore } from '@/stores/useIndicatorStore';
import { formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

interface IndicatorCellProps {
  label: string;
  value: number | null;
  valueColor?: string;
  status?: string;
  statusColor?: string;
}

function IndicatorCell({ label, value, valueColor = '', status, statusColor }: IndicatorCellProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="text-[12px] leading-none" style={{ color: '#7D90BE' }}>{label}</div>
      <div
        className={cn('text-xs font-mono font-semibold leading-none', valueColor)}
        style={!valueColor || valueColor === '' ? { color: '#B3C2E8' } : undefined}
      >
        {value === null ? '—' : formatNumber(value, 2)}
      </div>
      {status && value !== null && (
        <div className={cn('text-[11px] font-bold uppercase leading-none', statusColor)}>
          {status}
        </div>
      )}
    </div>
  );
}

export function IndicatorValues() {
  const { indicators } = useIndicatorStore();

  if (!indicators) return null;

  const rsi = indicators.rsi;
  const macd = indicators.macd?.MACD ?? null;
  const stochK = indicators.stochastic?.k ?? null;

  const rsiStatus = rsi === null ? undefined
    : rsi <= 30 ? 'Oversold' : rsi >= 70 ? 'Overbought' : 'Neutral';
  const rsiStatusColor = rsi === null ? undefined
    : rsi <= 30 ? 'text-green-300' : rsi >= 70 ? 'text-red-300' : 'text-slate-300';

  const macdStatus = macd === null ? undefined : macd > 0 ? 'Bullish' : 'Bearish';
  const macdStatusColor = macd === null ? undefined : macd > 0 ? 'text-green-300' : 'text-red-300';

  const stochStatus = stochK === null ? undefined
    : stochK < 20 ? 'Oversold' : stochK > 80 ? 'Overbought' : 'Neutral';
  const stochStatusColor = stochK === null ? undefined
    : stochK < 20 ? 'text-green-300' : stochK > 80 ? 'text-red-300' : 'text-slate-300';

  return (
    <div
      className="px-3.5 py-2.5"
      style={{ background: 'linear-gradient(180deg, #101a37, #0f1630)', borderTop: '1px solid #2A3F74' }}
    >
      <div className="grid grid-cols-6 gap-2">
        <IndicatorCell
          label="RSI"
          value={rsi}
          valueColor={rsi !== null ? (rsi <= 30 ? 'text-green-300' : rsi >= 70 ? 'text-red-300' : 'text-slate-100') : undefined}
          status={rsiStatus}
          statusColor={rsiStatusColor}
        />
        <IndicatorCell
          label="MACD"
          value={macd}
          valueColor={macd !== null ? (macd > 0 ? 'text-green-300' : 'text-red-300') : undefined}
          status={macdStatus}
          statusColor={macdStatusColor}
        />
        <IndicatorCell
          label="Signal"
          value={indicators.macd?.signal ?? null}
          valueColor={indicators.macd ? (indicators.macd.signal > 0 ? 'text-green-300' : 'text-red-300') : undefined}
        />
        <IndicatorCell
          label="Stoch K"
          value={stochK}
          valueColor={stochK !== null ? (stochK < 20 ? 'text-green-300' : stochK > 80 ? 'text-red-300' : 'text-slate-100') : undefined}
          status={stochStatus}
          statusColor={stochStatusColor}
        />
        <IndicatorCell label="ATR" value={indicators.atr} />
        <IndicatorCell label="EMA 9" value={indicators.ema9} valueColor="text-slate-100" />
      </div>
    </div>
  );
}
