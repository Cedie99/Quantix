import { useState } from 'react';
import {
  X, BookOpen, Shield, AlertTriangle, TrendingUp, TrendingDown,
  Activity, ChevronDown, ChevronUp, BarChart2, Waves, Zap,
} from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SIGNAL_TYPES = [
  {
    type: 'STRONG BUY',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
    icon: TrendingUp,
    desc: 'Most indicators point strongly upward. Strong bullish momentum is present.',
  },
  {
    type: 'BUY',
    color: '#4ade80',
    bg: 'rgba(34,197,94,0.05)',
    border: 'rgba(34,197,94,0.12)',
    icon: TrendingUp,
    desc: 'Several indicators lean bullish. Moderate upward pressure detected.',
  },
  {
    type: 'NEUTRAL',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.05)',
    border: 'rgba(234,179,8,0.12)',
    icon: Activity,
    desc: 'Mixed signals — no clear trend direction. Often best to wait.',
  },
  {
    type: 'SELL',
    color: '#f87171',
    bg: 'rgba(239,68,68,0.05)',
    border: 'rgba(239,68,68,0.12)',
    icon: TrendingDown,
    desc: 'Several indicators lean bearish. Moderate downward pressure detected.',
  },
  {
    type: 'STRONG SELL',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    icon: TrendingDown,
    desc: 'Most indicators point strongly downward. Strong bearish momentum is present.',
  },
];

const INDICATORS = [
  {
    short: 'RSI',
    name: 'Relative Strength Index',
    icon: Waves,
    color: '#60a5fa',
    desc: 'Measures whether a price is "overbought" (too high, may drop) or "oversold" (too low, may bounce). A reading below 30 often means oversold; above 70 often means overbought.',
  },
  {
    short: 'MACD',
    name: 'Trend Direction',
    icon: TrendingUp,
    color: '#a78bfa',
    desc: 'Compares two moving averages to detect trend direction and momentum. When the MACD line crosses above its signal line, it is considered a bullish sign.',
  },
  {
    short: 'EMA',
    name: 'Moving Averages',
    icon: Activity,
    color: '#34d399',
    desc: 'Shows the average price over different time periods (9, 21, 50, 200 candles). When shorter averages are above longer ones, the trend is generally up.',
  },
  {
    short: 'BB',
    name: 'Bollinger Bands',
    icon: Zap,
    color: '#fbbf24',
    desc: 'Measures how volatile (how much it is swinging) the price is. A "squeeze" means low volatility before a potential big move. Breaking above the upper band often signals strong upward momentum.',
  },
  {
    short: 'Stoch',
    name: 'Stochastic',
    icon: BarChart2,
    color: '#f472b6',
    desc: 'Similar to RSI — compares the current price to its range over a set period. Below 20 is oversold, above 80 is overbought. Most useful when it changes direction.',
  },
  {
    short: 'Vol',
    name: 'Volume',
    icon: BarChart2,
    color: '#94a3b8',
    desc: 'How much of the asset was traded. High volume on a price move confirms that the move is real and supported by buyers or sellers. Low volume moves are less reliable.',
  },
  {
    short: 'S/R',
    name: 'Support & Resistance',
    icon: Waves,
    color: '#fb923c',
    desc: 'Price levels where buying or selling pressure has historically been strong. "Support" acts like a floor — prices tend to bounce up. "Resistance" acts like a ceiling — prices tend to stall or drop.',
  },
  {
    short: 'MOM',
    name: 'Price Momentum',
    icon: Zap,
    color: '#22d3ee',
    desc: 'Measures how fast the price is changing. Rising momentum confirms a trend. Falling momentum can warn that a trend is losing steam and may reverse.',
  },
];

const STEPS = [
  { num: '1', title: 'Pick a coin', desc: 'Use the search bar at the top to find any crypto trading pair, like BTC/USDT or ETH/USDT.' },
  { num: '2', title: 'Choose a timeframe', desc: 'Select how long each "candle" represents. 1h and 4h tend to give more reliable, less noisy signals than 1m.' },
  { num: '3', title: 'Read the signal', desc: 'The center panel shows the current trend analysis. Green = bullish (uptrend), Red = bearish (downtrend), Yellow = no clear direction.' },
  { num: '4', title: 'Set your budget', desc: 'Enter your trading budget and risk percentage in the right panel. It will calculate suggested position sizes for you.' },
  { num: '5', title: 'Use the trade levels', desc: 'The entry, stop-loss, and profit targets are calculated based on ATR (volatility). These are suggestions — always verify before acting.' },
  { num: '6', title: 'Your decision', desc: 'Signals are a starting point, not a guarantee. Always do your own research and never risk more than you can afford to lose.' },
];

export function InfoModal({ open, onClose }: Props) {
  const [indicatorsExpanded, setIndicatorsExpanded] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        style={{ transition: 'opacity 0.2s' }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: '#131d3d',
          border: '1px solid #2A3F74',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.05)',
        }}
      >
        {/* Top shimmer */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid #2A3F74' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                boxShadow: '0 0 20px rgba(59,130,246,0.4)',
              }}
            >
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: '#E8EFFF' }}>How Quantix Works</h2>
              <p className="text-[11px]" style={{ color: '#7D90BE' }}>A signal reader — not a trading bot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-150"
            style={{ background: '#1c2a56', border: '1px solid #2A3F74', color: '#B3C2E8' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2A3F74'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1c2a56'; }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* What is this */}
          <Section icon={<Shield size={14} className="text-blue-400" />} title="What is Quantix?">
            <p className="text-sm leading-relaxed" style={{ color: '#B3C2E8' }}>
              Quantix is a <strong style={{ color: '#E8EFFF' }}>market signal reader</strong>. It analyzes
              8 technical indicators in real-time and tells you whether the current trend looks{' '}
              <strong style={{ color: '#22c55e' }}>bullish (up)</strong>,{' '}
              <strong style={{ color: '#ef4444' }}>bearish (down)</strong>, or{' '}
              <strong style={{ color: '#eab308' }}>neutral</strong>.
            </p>
            <div
              className="mt-3 rounded-xl px-4 py-3 flex items-start gap-3"
              style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)' }}
            >
              <Shield size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed" style={{ color: '#B3C2E8' }}>
                <strong style={{ color: '#60a5fa' }}>It does NOT place trades for you.</strong>{' '}
                It does not connect to any exchange. It only reads and analyzes publicly available
                price data. You remain in full control.
              </p>
            </div>
          </Section>

          {/* How to use */}
          <Section icon={<BookOpen size={14} className="text-emerald-400" />} title="How to Use It">
            <ol className="space-y-3">
              {STEPS.map((step) => (
                <li key={step.num} className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
                  >
                    {step.num}
                  </span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#E8EFFF' }}>{step.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#B3C2E8' }}>{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          {/* Signal types */}
          <Section icon={<TrendingUp size={14} className="text-violet-400" />} title="Understanding Signals">
            <div className="space-y-2">
              {SIGNAL_TYPES.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.type}
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: s.bg, border: `1px solid ${s.border}` }}
                  >
                    <Icon size={13} style={{ color: s.color }} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black" style={{ color: s.color }}>{s.type}</span>
                      <span className="text-xs ml-2" style={{ color: '#B3C2E8' }}>{s.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Indicator glossary (collapsible) */}
          <Section
            icon={<BarChart2 size={14} className="text-amber-400" />}
            title="Indicator Glossary"
            action={
              <button
                onClick={() => setIndicatorsExpanded((v) => !v)}
                className="flex items-center gap-1 text-[11px] font-semibold transition-colors duration-150"
                style={{ color: '#7D90BE' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#B3C2E8'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#7D90BE'; }}
              >
                {indicatorsExpanded ? <><ChevronUp size={12} /> Hide</> : <><ChevronDown size={12} /> Show all</>}
              </button>
            }
          >
            <div className={`space-y-2 overflow-hidden transition-all duration-300 ${indicatorsExpanded ? '' : 'max-h-0 opacity-0 pointer-events-none'}`}
              style={{ maxHeight: indicatorsExpanded ? 1000 : 0, opacity: indicatorsExpanded ? 1 : 0, transition: 'max-height 0.4s ease, opacity 0.3s ease' }}
            >
              {INDICATORS.map((ind) => {
                const Icon = ind.icon;
                return (
                  <div
                    key={ind.short}
                    className="rounded-xl p-3 space-y-1"
                    style={{ background: '#18244a', border: '1px solid #213363' }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-7 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: 'rgba(0,0,0,0.04)', color: ind.color }}
                      >
                        {ind.short}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: '#E8EFFF' }}>{ind.name}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: '#B3C2E8' }}>{ind.desc}</p>
                  </div>
                );
              })}
            </div>
            {!indicatorsExpanded && (
              <button
                onClick={() => setIndicatorsExpanded(true)}
                className="w-full rounded-xl py-2.5 text-xs font-semibold transition-all duration-150"
                style={{ background: '#18244a', border: '1px solid #213363', color: '#7D90BE' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#7D90BE'; (e.currentTarget as HTMLButtonElement).style.color = '#B3C2E8'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#213363'; (e.currentTarget as HTMLButtonElement).style.color = '#7D90BE'; }}
              >
                Show 8 indicators — RSI, MACD, EMA, Bollinger Bands & more
              </button>
            )}
          </Section>

          {/* Disclaimer */}
          <Section icon={<AlertTriangle size={14} className="text-amber-400" />} title="Important Disclaimer">
            <div
              className="rounded-xl px-4 py-4 space-y-2"
              style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.15)' }}
            >
              <p className="text-xs leading-relaxed" style={{ color: '#B3C2E8' }}>
                Quantix provides <strong style={{ color: '#fbbf24' }}>educational signal analysis only</strong>.
                It is not financial advice. Cryptocurrency trading involves significant risk — you can
                lose money. Past signals do not guarantee future results.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#B3C2E8' }}>
                Always do your own research, consult a financial advisor if needed, and never trade
                more than you can afford to lose.
              </p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({
  icon, title, children, action,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: '#B3C2E8' }}
          >
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}


