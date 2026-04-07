import { useMarketStore } from '@/stores/useMarketStore';
import { useChartStore } from '@/stores/useChartStore';
import { formatPercent, formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function TopMovers() {
  const { movers } = useMarketStore();
  const { setSymbol } = useChartStore();

  if (!movers) return null;

  const handleSelect = (rawSymbol: string) => {
    const sym = rawSymbol.toUpperCase();
    setSymbol(sym.endsWith('USDT') ? sym : sym + 'USDT');
  };

  return (
    <div className="p-4 space-y-2.5">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>
        Top Movers (24h)
      </h3>

      <div>
        <div className="flex items-center gap-1.5 text-[11px] text-green-300 font-bold mb-1.5 uppercase tracking-widest">
          <TrendingUp size={12} strokeWidth={2.5} />
          Gainers
        </div>
        <div className="space-y-1">
          {movers.gainers.slice(0, 3).map((coin) => (
            <button
              key={coin.id}
              onClick={() => handleSelect(coin.symbol)}
              className={cn(
                'w-full flex items-center justify-between text-xs px-1.5 py-1.5 rounded cursor-pointer',
                'border border-transparent transition-all duration-150 active:scale-[0.98]',
              )}
              style={{ background: 'rgba(22,163,74,0.16)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(22,163,74,0.24)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(22,163,74,0.26)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(22,163,74,0.16)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
              }}
              title={`View ${coin.symbol} chart`}
            >
              <div className="text-left">
                <span className="font-semibold" style={{ color: '#E8EFFF' }}>{coin.symbol}</span>
                <span className="text-[12px] ml-1" style={{ color: '#9EB0DA' }}>${formatPrice(coin.price)}</span>
              </div>
              <span className="text-green-300 font-semibold tabular-nums">
                +{formatPercent(coin.change24h)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-[11px] text-red-300 font-bold mb-1.5 uppercase tracking-widest">
          <TrendingDown size={12} strokeWidth={2.5} />
          Losers
        </div>
        <div className="space-y-1">
          {movers.losers.slice(0, 3).map((coin) => (
            <button
              key={coin.id}
              onClick={() => handleSelect(coin.symbol)}
              className={cn(
                'w-full flex items-center justify-between text-xs px-1.5 py-1.5 rounded cursor-pointer',
                'border border-transparent transition-all duration-150 active:scale-[0.98]',
              )}
              style={{ background: 'rgba(220,38,38,0.16)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.24)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(220,38,38,0.26)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.16)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
              }}
              title={`View ${coin.symbol} chart`}
            >
              <div className="text-left">
                <span className="font-semibold" style={{ color: '#E8EFFF' }}>{coin.symbol}</span>
                <span className="text-[12px] ml-1" style={{ color: '#9EB0DA' }}>${formatPrice(coin.price)}</span>
              </div>
              <span className="text-red-300 font-semibold tabular-nums">
                {formatPercent(coin.change24h)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
