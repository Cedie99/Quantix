import { useState, useRef } from 'react';
import { useEffect } from 'react';
import { Search } from 'lucide-react';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { fetchExchangeSymbols } from '@/services/api/binanceRest';
import type { ExchangeSymbol } from '@/types';

export function SymbolSearch() {
  const [query, setQuery] = useState('');
  const [symbols, setSymbols] = useState<ExchangeSymbol[]>([]);
  const [filtered, setFiltered] = useState<ExchangeSymbol[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { symbol, setSymbol } = useChartStore();
  const { addSymbol } = useWatchlistStore();

  useEffect(() => {
    fetchExchangeSymbols()
      .then(setSymbols)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!query) {
      setFiltered([]);
      return;
    }
    const q = query.toUpperCase();
    setFiltered(
      symbols
        .filter((s) => s.symbol.includes(q) || s.baseAsset.includes(q))
        .slice(0, 8)
    );
  }, [query, symbols]);

  function select(sym: string) {
    setSymbol(sym);
    addSymbol(sym);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="relative min-w-0 flex-1 md:flex-none">
      <div
        className="flex items-center gap-2 rounded-md px-3 py-1.5 transition-all duration-150"
        style={
          focused
            ? { background: '#131d3d', border: '1px solid #3B82F6' }
            : { background: '#18244a', border: '1px solid #2A3F74' }
        }
      >
        <Search size={14} className="shrink-0" style={{ color: '#7D90BE' }} />
        <input
          ref={inputRef}
          type="text"
          value={open ? query : symbol}
          placeholder="Search symbol..."
          onFocus={() => { setQuery(symbol); setOpen(true); setFocused(true); }}
          onBlur={() => { setTimeout(() => setOpen(false), 200); setFocused(false); }}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          className="bg-transparent text-sm outline-none w-24 sm:w-32 lg:w-48 min-w-0"
          style={{ color: '#E8EFFF' }}
        />
      </div>

      {open && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 mt-1 w-[min(16rem,calc(100vw-1rem))] rounded-md shadow-xl z-50 overflow-hidden"
          style={{ background: '#131d3d', border: '1px solid #2A3F74' }}
        >
          {filtered.map((s) => (
            <button
              key={s.symbol}
              onMouseDown={() => select(s.symbol)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left"
              style={{ color: '#E8EFFF' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1c2a56'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <span className="font-medium">{s.symbol}</span>
              <span className="text-xs" style={{ color: '#7D90BE' }}>{s.baseAsset}/USDT</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


