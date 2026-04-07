import { useState } from 'react';
import { useSignalStore } from '@/stores/useSignalStore';
import { useRiskStore } from '@/stores/useRiskStore';
import { SIGNAL_CONFIG } from './signalConfig';
import { RiskPanel } from '@/components/risk/RiskPanel';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Activity, HelpCircle, Copy, Check } from 'lucide-react';

const LEVEL_TOOLTIPS = {
  entry: 'The suggested price to enter the trade based on the current market price.',
  stop: 'Exit here if the trade goes against you. This limits your maximum loss.',
  tp1: '2:1 reward-to-risk target — a good first take-profit level.',
  tp2: '3:1 reward-to-risk target — if the trend continues strongly.',
};

export function TradeTab() {
  const signal = useSignalStore((s) => s.signal);
  const risk = useRiskStore((s) => s.risk);

  if (!signal) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm" style={{ color: '#7D90BE' }}>Waiting for signal…</span>
      </div>
    );
  }

  const cfg = SIGNAL_CONFIG[signal.type];
  const isSell = signal.type === 'SELL' || signal.type === 'STRONG_SELL';
  const isNeutral = signal.type === 'NEUTRAL';

  let tradeLevels: { entry: number; stopLoss: number; tp1: number; tp2: number } | null = null;
  if (risk && !isNeutral) {
    const entry = risk.entryPrice;
    const dist = risk.stopDistance;
    tradeLevels = isSell
      ? { entry, stopLoss: entry + dist, tp1: entry - dist * 2, tp2: entry - dist * 3 }
      : { entry, stopLoss: entry - dist, tp1: entry + dist * 2, tp2: entry + dist * 3 };
  }

  return (
    <div className="flex flex-col">
      {/* Trade levels */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid #2A3F74' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>
            {isSell ? 'Short Trade Levels' : isNeutral ? 'Trade Levels' : 'Long Trade Levels'}
          </h4>
          <TradeLevelHelp />
        </div>

        {isNeutral ? (
          <div
            className="rounded-2xl px-4 py-5 text-center"
            style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.15)' }}
          >
            <Activity size={20} className="mx-auto mb-2 text-yellow-500/50" />
            <p className="text-sm font-semibold text-yellow-500/70">No active trade setup</p>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#7D90BE' }}>
              Wait for a directional signal before looking at trade levels.
            </p>
          </div>
        ) : tradeLevels ? (
          <>
            <div
              className="grid grid-cols-2 rounded-2xl overflow-hidden"
              style={{ border: '1px solid #2A3F74' }}
            >
              <TradeCell label={isSell ? 'Sell At' : 'Buy At'} value={`$${formatPrice(tradeLevels.entry)}`} sub="Entry" tooltip={LEVEL_TOOLTIPS.entry} valueColor="text-slate-100" bgStyle={{ background: '#131d3d' }} topBorderColor="#7D90BE" />
              <TradeCell label="Stop Loss" value={`$${formatPrice(tradeLevels.stopLoss)}`} sub="If wrong — exit" tooltip={LEVEL_TOOLTIPS.stop} valueColor="text-red-400" bgStyle={{ background: 'rgba(239,68,68,0.05)' }} topBorderColor="#ef4444" divider />
              <TradeCell label="Target 1" value={`$${formatPrice(tradeLevels.tp1)}`} sub="2× reward" tooltip={LEVEL_TOOLTIPS.tp1} valueColor="text-green-400" bgStyle={{ background: 'rgba(34,197,94,0.04)' }} topBorderColor="#22c55e" borderTop />
              <TradeCell label="Target 2" value={`$${formatPrice(tradeLevels.tp2)}`} sub="3× reward" tooltip={LEVEL_TOOLTIPS.tp2} valueColor="text-green-600" bgStyle={{ background: 'rgba(34,197,94,0.06)' }} topBorderColor="#22c55e" divider borderTop />
            </div>
            <p className="text-[10px] mt-2 text-center" style={{ color: '#7D90BE' }}>
              Click any price to copy · ATR-based volatility levels
            </p>
          </>
        ) : (
          <div
            className="rounded-2xl px-4 py-5 text-center"
            style={{ border: '1px solid #2A3F74', background: '#131d3d' }}
          >
            <p className="text-xs" style={{ color: '#7D90BE' }}>
              Set your trading budget below to see trade levels.
            </p>
          </div>
        )}
      </div>

      {/* Position sizing */}
      <RiskPanel />
    </div>
  );
}

function TradeLevelHelp() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] font-semibold"
        style={{ color: open ? '#60a5fa' : '#7D90BE' }}
      >
        <HelpCircle size={11} /> How are these calculated?
      </button>
      {open && (
        <div
          className="absolute right-0 top-6 z-30 w-64 rounded-2xl p-4 space-y-3 shadow-2xl"
          style={{ background: '#131d3d', border: '1px solid #2A3F74', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>Trade Level Explanation</p>
          {[
            { label: 'Entry', color: '#B3C2E8', desc: LEVEL_TOOLTIPS.entry },
            { label: 'Stop Loss', color: '#ef4444', desc: LEVEL_TOOLTIPS.stop },
            { label: 'Target 1', color: '#22c55e', desc: LEVEL_TOOLTIPS.tp1 },
            { label: 'Target 2', color: '#4ade80', desc: LEVEL_TOOLTIPS.tp2 },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <span className="text-[11px] font-bold shrink-0 w-14" style={{ color: item.color }}>{item.label}</span>
              <p className="text-[11px] leading-relaxed" style={{ color: '#B3C2E8' }}>{item.desc}</p>
            </div>
          ))}
          <button onClick={() => setOpen(false)} className="text-[10px] font-semibold block text-right w-full" style={{ color: '#7D90BE' }}>Close ×</button>
        </div>
      )}
    </div>
  );
}

function TradeCell({
  label, value, sub, tooltip, valueColor, bgStyle, topBorderColor, divider = false, borderTop = false,
}: {
  label: string; value: string; sub: string; tooltip: string;
  valueColor: string; bgStyle: React.CSSProperties; topBorderColor: string;
  divider?: boolean; borderTop?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    const raw = value.replace('$', '').replace(/,/g, '');
    navigator.clipboard.writeText(raw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col items-center justify-center px-3 py-4 text-center gap-1 cursor-pointer transition-all duration-150 active:scale-95"
      style={{
        ...bgStyle,
        borderTop: borderTop ? `1px solid #2A3F74` : `2px solid ${topBorderColor}`,
        ...(divider ? { borderLeft: '1px solid #2A3F74' } : {}),
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.15)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1)'; }}
    >
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#7D90BE' }}>{label}</span>
      <span className={cn('text-sm font-black font-mono tabular-nums', valueColor)}>
        {copied ? <span className="flex items-center gap-1 text-green-400"><Check size={12} /> Copied</span> : value}
      </span>
      <span className="text-[10px] leading-tight" style={{ color: '#7D90BE' }}>{sub}</span>
      <Copy size={9} className="absolute top-2 right-2 opacity-0 group-hover:opacity-30" style={{ color: '#B3C2E8' }} />
    </div>
  );
}


