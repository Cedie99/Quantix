import { useEffect, useState } from 'react';
import { useSignalStore } from '@/stores/useSignalStore';
import { useRiskStore } from '@/stores/useRiskStore';
import { SIGNAL_CONFIG } from './signalConfig';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Clock } from 'lucide-react';

export function SignalHero() {
  const signal = useSignalStore((s) => s.signal);
  const risk = useRiskStore((s) => s.risk);
  const [scoreVisible, setScoreVisible] = useState(false);

  useEffect(() => {
    setScoreVisible(false);
    const t = setTimeout(() => setScoreVisible(true), 80);
    return () => clearTimeout(t);
  }, [signal?.type]);

  if (!signal) {
    return (
      <div
        className="flex items-center justify-center gap-2 shrink-0"
        style={{ height: 110, borderBottom: '1px solid #2A3F74' }}
      >
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: '#2A3F74', borderTopColor: '#3B82F6' }}
        />
        <span className="text-xs" style={{ color: '#7D90BE' }}>Analyzing…</span>
      </div>
    );
  }

  const cfg = SIGNAL_CONFIG[signal.type];
  const isSell = signal.type === 'SELL' || signal.type === 'STRONG_SELL';
  const isNeutral = signal.type === 'NEUTRAL';
  const absScore = Math.abs(signal.score);

  const confidenceColor =
    signal.confidence >= 75 ? '#22c55e' : signal.confidence >= 50 ? '#eab308' : '#ef4444';

  const secondsAgo = Math.floor((Date.now() - signal.timestamp) / 1000);
  const timeAgo = secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`;

  let entry: number | null = null;
  let stop: number | null = null;
  if (risk && !isNeutral) {
    const dist = risk.stopDistance;
    entry = risk.entryPrice;
    stop = isSell ? entry + dist : entry - dist;
  }

  return (
    <div
      className={cn('relative shrink-0 overflow-hidden px-4 py-3', cfg.bannerBg)}
      style={{ borderBottom: '1px solid #2A3F74' }}
    >
      {/* Glow */}
      <div
        className="absolute -top-6 -left-6 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: cfg.glowColor, filter: 'blur(40px)', opacity: 0.4 }}
      />
      <div className="relative">
        {/* Row 1: icon + label + confidence */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(13,22,48,0.92)',
                border: `1px solid ${cfg.guidanceBorder}`,
                boxShadow: `0 6px 14px ${cfg.glowColor}`,
              }}
            >
              <cfg.Icon
                className={cn(cfg.textColor, cfg.pulse && 'animate-pulse')}
                size={14}
                strokeWidth={2.5}
              />
            </div>
            <span className={cn('text-base font-black tracking-tight', cfg.textColor)}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tabular-nums" style={{ color: '#E8EFFF' }}>
              {signal.confidence}%
            </span>
            <div className="flex items-center gap-1" style={{ color: '#7D90BE' }}>
              <Clock size={9} />
              <span className="text-[10px]">{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Score bar */}
        <div
          className="relative h-2 rounded-full overflow-hidden mb-2"
          style={{ background: '#18244a', border: '1px solid #2A3F74' }}
        >
          <div className="absolute inset-y-0 left-1/2 w-px z-10" style={{ background: '#7D90BE' }} />
          {signal.score >= 0 ? (
            <div
              className={cn('absolute inset-y-0 left-1/2 rounded-r-full transition-all duration-700', cfg.scoreBarColor)}
              style={{ width: scoreVisible ? `${absScore / 2}%` : '0%' }}
            />
          ) : (
            <div
              className={cn('absolute inset-y-0 right-1/2 rounded-l-full transition-all duration-700', cfg.scoreBarColor)}
              style={{ width: scoreVisible ? `${absScore / 2}%` : '0%' }}
            />
          )}
        </div>

        {/* Row 3: entry + stop compact */}
        {entry !== null && stop !== null ? (
          <div className="flex gap-3 text-[10px]">
            <span style={{ color: '#7D90BE' }}>Entry <span className="font-bold font-mono" style={{ color: '#B3C2E8' }}>${formatPrice(entry)}</span></span>
            <span style={{ color: '#7D90BE' }}>Stop <span className="font-bold font-mono text-red-300">${formatPrice(stop)}</span></span>
            <span style={{ color: '#7D90BE' }}>Score <span className={cn('font-bold font-mono', cfg.scoreColor)}>{signal.score > 0 ? '+' : ''}{signal.score}</span></span>
          </div>
        ) : (
          <div className="text-[10px]" style={{ color: '#7D90BE' }}>
            {isNeutral ? 'No trade setup — wait for direction' : 'Set budget in Trade tab for levels'}
          </div>
        )}
      </div>
    </div>
  );
}


