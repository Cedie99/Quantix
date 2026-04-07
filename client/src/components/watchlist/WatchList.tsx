import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useChartStore } from '@/stores/useChartStore';
import { formatPrice, formatPercent } from '@/utils/format';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

export function WatchList() {
  const { items, removeSymbol } = useWatchlistStore();
  const { symbol, setSymbol } = useChartStore();

  return (
    <div className="p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#64748B' }}>
          Watchlist
        </span>
        {items.length > 0 && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-md tabular-nums"
            style={{ background: '#18244A', color: '#9EB0DA', border: '1px solid #2A3F74' }}
          >
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 py-6 text-center">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#18244a', border: '1px solid #2A3F74' }}
          >
            <TrendingUp size={15} style={{ color: '#7D90BE' }} />
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: '#7D90BE' }}>
            Search above to<br />start tracking symbols
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => {
            const isActive = symbol === item.symbol;
            const posChange = item.change24h !== undefined && item.change24h >= 0;
            return (
              <div
                key={item.symbol}
                onClick={() => setSymbol(item.symbol)}
                className="group relative flex items-center justify-between rounded-xl cursor-pointer transition-all duration-200"
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(91,123,255,0.2), rgba(91,123,255,0.08))',
                  boxShadow: 'inset 3px 0 0 #5B7BFF, inset 0 0 0 1px rgba(91,123,255,0.35)',
                  padding: '8px 10px 8px 9px',
                } : {
                  padding: '8px 10px 8px 12px',
                  boxShadow: 'inset 0 0 0 1px transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = '#131D3D';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'inset 0 0 0 1px #2A3F74';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'inset 0 0 0 1px transparent';
                  }
                }}
              >
                {/* Symbol + price */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1 leading-none mb-0.5">
                    <span
                      className="text-sm font-bold tracking-tight"
                      style={{ color: isActive ? '#E8EFFF' : '#B3C2E8' }}
                    >
                      {item.symbol.replace('USDT', '')}
                    </span>
                    <span className="text-[11px] font-normal" style={{ color: '#7D90BE' }}>/USDT</span>
                  </div>
                  {item.price && (
                    <div className="text-[11px] font-mono tabular-nums" style={{ color: '#7D90BE' }}>
                      ${formatPrice(item.price)}
                    </div>
                  )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.change24h !== undefined && (
                    <span
                      className="flex items-center gap-0.5 text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md"
                      style={posChange
                        ? { background: 'rgba(22,163,74,0.22)', color: '#86efac' }
                        : { background: 'rgba(220,38,38,0.22)', color: '#fca5a5' }
                      }
                    >
                      {posChange
                        ? <TrendingUp size={9} strokeWidth={2.5} />
                        : <TrendingDown size={9} strokeWidth={2.5} />
                      }
                      {item.change24h >= 0 ? '+' : ''}{formatPercent(item.change24h)}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSymbol(item.symbol); }}
                    className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150"
                    style={{ color: '#64748B' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = '#64748B';
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                    title="Remove"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
