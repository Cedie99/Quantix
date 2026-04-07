import { useMarketStore } from '@/stores/useMarketStore';
import { formatPercent, formatMarketCap } from '@/utils/format';
import { cn } from '@/utils/cn';

function getFGColor(value: number) {
  if (value <= 25) return { text: 'text-red-700', bar: 'bg-red-500', glow: 'rgba(220,38,38,0.22)' };
  if (value <= 45) return { text: 'text-orange-700', bar: 'bg-orange-500', glow: 'rgba(234,88,12,0.2)' };
  if (value <= 55) return { text: 'text-amber-700', bar: 'bg-amber-500', glow: 'rgba(217,119,6,0.2)' };
  if (value <= 75) return { text: 'text-lime-700', bar: 'bg-lime-500', glow: 'rgba(101,163,13,0.2)' };
  return { text: 'text-green-700', bar: 'bg-green-500', glow: 'rgba(22,163,74,0.22)' };
}

export function MarketOverview() {
  const { overview } = useMarketStore();

  if (!overview) {
    return (
      <div className="p-3.5">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: '#64748B' }}>
          Market Pulse
        </h3>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: '#18244a' }} />
          ))}
        </div>
      </div>
    );
  }

  const fearGreed = overview.fearGreed;
  const fgColors = fearGreed ? getFGColor(fearGreed.value) : null;
  const mcapChange = overview.marketCapChangePercentage24h;

  return (
    <div className="p-4 space-y-3.5">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#64748B' }}>
        Market Pulse
      </h3>

      {/* 2×2 stat grid */}
      <div className="grid grid-cols-2 gap-1.5">
        <StatCard
          label="BTC Dom."
          value={`${overview.btcDominance.toFixed(1)}%`}
          valueColor="text-orange-300"
        />
        <StatCard
          label="ETH Dom."
          value={`${overview.ethDominance.toFixed(1)}%`}
          valueColor="text-indigo-300"
        />
        <StatCard
          label="Mkt Cap"
          value={formatMarketCap(overview.totalMarketCap)}
          valueStyle={{ color: '#E8EFFF' }}
        />
        <StatCard
          label="24h Δ"
          value={(mcapChange >= 0 ? '+' : '') + formatPercent(mcapChange)}
          valueColor={mcapChange >= 0 ? 'text-green-300' : 'text-red-300'}
          positive={mcapChange >= 0}
        />
      </div>

      {/* Fear & Greed card */}
      {fearGreed && fgColors && (
        <div
          className="rounded-xl p-3 space-y-2.5"
          style={{ background: 'linear-gradient(180deg, #131D3D, #0F1630)', border: '1px solid #2A3F74' }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>
              Fear &amp; Greed
            </span>
            <span className={cn('text-[11px] font-bold', fgColors.text)}>
              {fearGreed.classification}
            </span>
          </div>

          {/* Big value + bar */}
          <div className="flex items-end gap-3">
            <span
              className={cn('text-3xl font-black tabular-nums leading-none', fgColors.text)}
              style={{ textShadow: `0 0 20px ${fgColors.glow}` }}
            >
              {fearGreed.value}
            </span>
            <div className="flex-1 space-y-1 pb-0.5">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1B2A55' }}>
                <div
                  className={cn('h-full rounded-full transition-all duration-700', fgColors.bar)}
                  style={{
                    width: `${fearGreed.value}%`,
                    boxShadow: `0 0 8px ${fgColors.glow}`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px]" style={{ color: '#7D90BE' }}>
                <span>Fear</span>
                <span>Greed</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, valueColor = '', valueStyle, positive,
}: {
  label: string;
  value: string;
  valueColor?: string;
  valueStyle?: React.CSSProperties;
  positive?: boolean;
}) {
  return (
    <div
      className="rounded-lg px-2.5 py-2"
      style={{ background: '#131D3D', border: '1px solid #2A3F74' }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#7D90BE' }}>
        {label}
      </div>
      <div className={cn('text-sm font-bold tabular-nums', valueColor)} style={valueStyle}>
        {value}
      </div>
    </div>
  );
}
