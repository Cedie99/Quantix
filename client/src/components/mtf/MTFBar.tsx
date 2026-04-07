import { useMultiTimeframeSignals } from '@/hooks/useMultiTimeframeSignals';
import type { SignalType } from '@/types';

const ARROW: Record<SignalType, string> = {
  STRONG_BUY: '▲▲',
  BUY: '▲',
  NEUTRAL: '◆',
  SELL: '▼',
  STRONG_SELL: '▼▼',
};

const COLOR: Record<SignalType, string> = {
  STRONG_BUY: '#86efac',
  BUY: '#4ade80',
  NEUTRAL: '#facc15',
  SELL: '#fca5a5',
  STRONG_SELL: '#f87171',
};

const BG: Record<SignalType, string> = {
  STRONG_BUY: 'rgba(22,163,74,0.14)',
  BUY: 'rgba(21,128,61,0.1)',
  NEUTRAL: 'rgba(217,119,6,0.1)',
  SELL: 'rgba(220,38,38,0.1)',
  STRONG_SELL: 'rgba(185,28,28,0.14)',
};

const BORDER: Record<SignalType, string> = {
  STRONG_BUY: 'rgba(22,163,74,0.3)',
  BUY: 'rgba(21,128,61,0.24)',
  NEUTRAL: 'rgba(217,119,6,0.24)',
  SELL: 'rgba(220,38,38,0.24)',
  STRONG_SELL: 'rgba(185,28,28,0.3)',
};

export function MTFBar() {
  const { signals, loading, timeframes } = useMultiTimeframeSignals();

  return (
    <div
      className="flex items-center gap-2 px-3 shrink-0"
      style={{
        height: 42,
        background: 'rgba(11,18,40,0.9)',
        borderBottom: '1px solid rgba(42,63,116,0.75)',
      }}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest shrink-0 mr-1" style={{ color: '#7D90BE' }}>
        MTF
      </span>

      {loading
        ? timeframes.map((tf) => (
            <div
              key={tf}
              className="h-6 w-14 rounded-md animate-pulse"
              style={{ background: '#18244a' }}
            />
          ))
        : timeframes.map((tf) => {
            const sig = signals[tf];
            if (!sig) {
              return (
                <div
                  key={tf}
                  className="flex items-center gap-1 px-2 h-6 rounded-md text-[10px] font-bold"
                  style={{ background: '#18244a', color: '#7D90BE', border: '1px solid #2A3F74' }}
                >
                  {tf} <span style={{ color: '#7D90BE' }}>–</span>
                </div>
              );
            }
            return (
              <div
                key={tf}
                className="flex items-center gap-1 px-2 h-6 rounded-md text-[10px] font-bold"
                style={{
                  background: BG[sig.type],
                  color: COLOR[sig.type],
                  border: `1px solid ${BORDER[sig.type]}`,
                }}
                title={`${tf}: ${sig.type} (score ${sig.score})`}
              >
                <span style={{ color: '#B3C2E8' }}>{tf}</span>
                <span>{ARROW[sig.type]}</span>
              </div>
            );
          })}
    </div>
  );
}


