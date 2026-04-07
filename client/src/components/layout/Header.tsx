import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { AlertBell } from '@/components/alerts/AlertBell';
import { SymbolSearch } from '@/components/watchlist/SymbolSearch';
import { TIMEFRAMES } from '@/constants';
import { formatPrice, formatPercent } from '@/utils/format';
import { cn } from '@/utils/cn';
import { HelpCircle } from 'lucide-react';
import type { Timeframe } from '@/types';

function UserMenu() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (!user) return null;
  const initials = user.email ? user.email[0].toUpperCase() : '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 select-none hover:bg-white/10"
        style={{ background: '#1A2550', border: '1px solid #2A3F74', color: '#E8EFFF' }}
        title={user.email}
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 w-56 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{
              background: 'rgba(12,19,41,0.96)',
              border: '1px solid rgba(42,63,116,0.9)',
            backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 46px rgba(2,5,15,0.55)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-400/45 to-transparent" />
          <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(42,63,116,0.8)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#7D90BE' }}>Signed in as</p>
            <p className="text-xs truncate font-medium" style={{ color: '#B3C2E8' }}>{user.email}</p>
          </div>
          <div className="p-1.5">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm rounded-xl transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400"
              style={{ color: '#9EB0DA' }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header({ onInfoClick }: { onInfoClick?: () => void }) {
  const { symbol, timeframe, setTimeframe, candles } = useChartStore();
  const { items } = useWatchlistStore();

  const currentPrice = candles.length > 0 ? candles[candles.length - 1].close : null;
  const watchItem = items.find((i) => i.symbol === symbol);
  const change24h = watchItem?.change24h;
  const isPositive = change24h !== undefined && change24h >= 0;
  const displaySymbol = symbol.replace('USDT', '');

  return (
    <header
      className="relative z-30 flex items-center justify-between px-3 sm:px-5 shrink-0"
      style={{
        background: 'rgba(8,13,31,0.72)',
        borderBottom: '1px solid rgba(33,51,99,0.9)',
        height: 64,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none shrink-0"
          style={{
            background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
            boxShadow: '0 0 20px rgba(59,130,246,0.35)',
          }}
        >
          Q
        </div>
        <span className="font-bold text-sm hidden sm:block tracking-tight" style={{ color: '#E8EFFF' }}>
          Quantix
        </span>
      </div>

      {/* ── Center: search + timeframes ── */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 px-2 sm:px-4">
        <SymbolSearch />

        {/* Timeframe strip */}
        <div
          className="hidden md:flex items-center gap-1 p-1 rounded-xl"
          style={{ background: '#0f1630', border: '1px solid #213363' }}
        >
          {TIMEFRAMES.map((tf) => {
            const active = timeframe === tf.value;
            return (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value as Timeframe)}
                className="px-3 py-1 text-xs rounded-lg font-semibold transition-all duration-200"
                style={active ? {
                  background: 'linear-gradient(135deg, #5B7BFF, #8B7DFF)',
                  color: '#FFFFFF',
                  boxShadow: '0 0 16px rgba(91,123,255,0.5)',
                } : { color: '#7D90BE' }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.color = '#B3C2E8';
                    (e.currentTarget as HTMLButtonElement).style.background = '#16234A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.color = '#7D90BE';
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }
                }}
              >
                {tf.label}
              </button>
            );
          })}
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as Timeframe)}
          className="md:hidden ml-auto rounded-lg px-2 py-1 text-xs font-semibold outline-none"
          style={{ background: '#0f1630', border: '1px solid #213363', color: '#B3C2E8' }}
        >
          {TIMEFRAMES.map((tf) => (
            <option key={tf.value} value={tf.value}>{tf.label}</option>
          ))}
        </select>
      </div>

      {/* ── Right: price + actions ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {currentPrice !== null && (
          <>
            {/* Separator */}
            <div className="hidden xl:block h-6 w-px" style={{ background: 'rgba(53,80,143,0.65)' }} />
            <div className="hidden xl:flex items-center gap-2.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(19,29,61,0.72)', border: '1px solid rgba(42,63,116,0.6)' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tabular-nums" style={{ color: '#E8EFFF' }}>
                  ${formatPrice(currentPrice)}
                </span>
                {change24h !== undefined && (
                  <span
                    className={cn(
                      'text-[11px] font-bold px-1.5 py-0.5 rounded-md tabular-nums',
                      isPositive ? 'text-green-300' : 'text-red-300',
                    )}
                    style={isPositive
                      ? { background: 'rgba(22,163,74,0.22)' }
                      : { background: 'rgba(220,38,38,0.22)' }
                    }
                  >
                    {isPositive ? '+' : ''}{formatPercent(change24h)}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold" style={{ color: '#7D90BE' }}>
                {displaySymbol}/USDT
              </span>
            </div>
          </>
        )}

        <div className="h-6 w-px hidden xl:block" style={{ background: 'rgba(53,80,143,0.65)' }} />

        <div className="flex items-center gap-1 px-1 py-1 rounded-xl" style={{ background: 'rgba(19,29,61,0.72)', border: '1px solid rgba(42,63,116,0.6)' }}>
          {/* Info / Help button */}
          <button
            onClick={onInfoClick}
            title="How it works"
            className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center transition-all duration-200 hover:text-blue-300 hover:border-blue-400/50 hover:shadow-[0_0_0_3px_rgba(91,123,255,0.2)]"
            style={{ background: '#1A2550', border: '1px solid #2A3F74', color: '#7D90BE' }}
          >
            <HelpCircle size={14} />
          </button>
          <AlertBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}


