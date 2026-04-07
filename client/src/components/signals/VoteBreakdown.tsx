import { useState } from 'react';
import type { Vote } from '@/types';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props {
  votes: Vote[];
}

// ─── Plain-English descriptions for each indicator ─────────────────────────────

const INDICATOR_INFO: Record<string, {
  name: string;
  short: string;
  what: string;
  bullishMeans: string;
  bearishMeans: string;
}> = {
  RSI: {
    name: 'Momentum (RSI)',
    short: 'RSI',
    what: 'Measures whether the price is moving too fast in one direction. Useful for spotting potential reversals.',
    bullishMeans: 'Price is in a healthy uptrend zone, or recovering from oversold territory (bouncing back up).',
    bearishMeans: 'Price may be overbought (too high too fast) or in a confirmed downtrend.',
  },
  MACD: {
    name: 'Trend Direction (MACD)',
    short: 'MACD',
    what: 'Compares two moving averages to detect the direction and strength of a trend.',
    bullishMeans: 'The trend is pointing upward. Short-term average is above the long-term one.',
    bearishMeans: 'The trend is pointing downward. Short-term average crossed below long-term.',
  },
  EMA: {
    name: 'Moving Averages (EMA)',
    short: 'EMA',
    what: 'Shows the average price over different timeframes. When they stack in order, it confirms a strong trend.',
    bullishMeans: 'Shorter averages are above longer ones — trend is up and aligned.',
    bearishMeans: 'Shorter averages are below longer ones — trend is down or weakening.',
  },
  Bollinger: {
    name: 'Volatility (Bollinger)',
    short: 'BB',
    what: 'Measures how much the price is swinging. Breaking a band shows strong momentum.',
    bullishMeans: 'Price breaking above the upper band or bouncing from the lower band.',
    bearishMeans: 'Price breaking below the lower band or rejected at the upper band.',
  },
  Stochastic: {
    name: 'Stochastic Momentum',
    short: 'Stoch',
    what: 'Helps identify when price is at an extreme — very high or very low in its recent range.',
    bullishMeans: 'Recovering from oversold or crossing upward — may continue rising.',
    bearishMeans: 'At an overbought high or crossing downward — may start falling.',
  },
  Volume: {
    name: 'Volume',
    short: 'Vol',
    what: 'Measures how much was traded. Strong moves backed by high volume are more reliable.',
    bullishMeans: 'High volume on up moves confirms buyers are in control.',
    bearishMeans: 'High volume on down moves confirms sellers are in control.',
  },
  'S/R': {
    name: 'Support / Resistance',
    short: 'S/R',
    what: 'Key price levels where buyers or sellers have historically been active — floors and ceilings.',
    bullishMeans: 'Price near or bouncing off a support level — buyers tend to step in here.',
    bearishMeans: 'Price near or rejected by a resistance level — sellers push back here.',
  },
  Momentum: {
    name: 'Price Momentum',
    short: 'MOM',
    what: 'Measures how fast the price is changing. Strong momentum confirms a trend.',
    bullishMeans: 'Price increase is strong and accelerating — trend likely continuing up.',
    bearishMeans: 'Price decline is strong or upward momentum is fading — may reverse.',
  },
};

function getFriendlyInfo(indicator: string) {
  for (const [key, val] of Object.entries(INDICATOR_INFO)) {
    if (indicator.includes(key)) return val;
  }
  return {
    name: indicator,
    short: indicator.slice(0, 4),
    what: 'Technical analysis indicator.',
    bullishMeans: 'Pointing upward.',
    bearishMeans: 'Pointing downward.',
  };
}

// ─── Main component ────────────────────────────────────────────────────────────

export function VoteBreakdown({ votes }: Props) {
  const bullish = votes.filter((v) => v.vote === 1).length;
  const bearish = votes.filter((v) => v.vote === -1).length;
  const neutral = votes.filter((v) => v.vote === 0).length;
  const total = votes.length;

  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>
          What the Indicators Say
        </h4>
        <div className="flex items-center gap-1.5">
          <Pill count={bullish} label="Bullish" color="green" />
          {neutral > 0 && <Pill count={neutral} label="Neutral" color="neutral" />}
          <Pill count={bearish} label="Bearish" color="red" />
        </div>
      </div>

      {/* Ratio bar */}
      <div>
        <div className="h-2 flex rounded-full overflow-hidden gap-px" style={{ background: '#18244a' }}>
          {bullish > 0 && (
            <div
              className="bg-green-500 transition-all duration-700 rounded-l-full"
              style={{ width: `${(bullish / total) * 100}%` }}
            />
          )}
          {neutral > 0 && (
            <div
              className="transition-all duration-700"
              style={{ width: `${(neutral / total) * 100}%`, background: '#7D90BE' }}
            />
          )}
          {bearish > 0 && (
            <div
              className="bg-red-500 transition-all duration-700 rounded-r-full"
              style={{ width: `${(bearish / total) * 100}%` }}
            />
          )}
        </div>
        <div className="flex justify-between text-[10px] mt-1 font-medium" style={{ color: '#7D90BE' }}>
          <span>{bullish} bullish</span>
          {neutral > 0 && <span>{neutral} neutral</span>}
          <span>{bearish} bearish</span>
        </div>
      </div>

      {/* Vertical list */}
      <div className="space-y-1.5">
        {votes.map((vote) => (
          <VoteRow key={vote.indicator} vote={vote} />
        ))}
      </div>

    </div>
  );
}

// ─── Pill ──────────────────────────────────────────────────────────────────────

function Pill({ count, label, color }: { count: number; label: string; color: 'green' | 'red' | 'neutral' }) {
  const styles = {
    green:   { background: 'rgba(22,163,74,0.1)',   color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' },
    red:     { background: 'rgba(220,38,38,0.1)',   color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' },
    neutral: { background: 'rgba(100,116,139,0.1)', color: '#7D90BE', border: '1px solid rgba(100,116,139,0.2)' },
  }[color];
  const Icon = color === 'green' ? TrendingUp : color === 'red' ? TrendingDown : Minus;
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={styles}>
      <Icon size={10} strokeWidth={2.5} />
      {count} {label}
    </span>
  );
}

// ─── Vote row ──────────────────────────────────────────────────────────────────

function VoteRow({ vote }: { vote: Vote }) {
  const [expanded, setExpanded] = useState(false);
  const info = getFriendlyInfo(vote.indicator);
  const isUp   = vote.vote === 1;
  const isDown = vote.vote === -1;

  const voteColor = isUp ? '#16a34a' : isDown ? '#dc2626' : '#7D90BE';
  const badgeBg   = isUp ? 'rgba(22,163,74,0.1)'  : isDown ? 'rgba(220,38,38,0.1)'  : 'rgba(100,116,139,0.08)';
  const badgeBorder = isUp ? 'rgba(22,163,74,0.25)' : isDown ? 'rgba(220,38,38,0.25)' : 'rgba(100,116,139,0.2)';
  const rowBg    = isUp ? 'rgba(22,163,74,0.04)'  : isDown ? 'rgba(220,38,38,0.04)'  : 'rgba(100,116,139,0.03)';
  const rowBorder = isUp ? 'rgba(22,163,74,0.15)' : isDown ? 'rgba(220,38,38,0.15)' : '#E2E8F0';

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow duration-200"
      style={{ background: rowBg, border: `1px solid ${rowBorder}` }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-3 py-2.5">

        {/* Badge */}
        <span
          className="shrink-0 w-10 h-6 rounded-md flex items-center justify-center text-[10px] font-bold tabular-nums"
          style={{ background: badgeBg, color: voteColor, border: `1px solid ${badgeBorder}` }}
        >
          {info.short}
        </span>

        {/* Name + reason */}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold leading-tight mb-0.5" style={{ color: '#E8EFFF' }}>
            {info.name}
          </div>
          <div className="text-[11px] leading-snug" style={{ color: '#7D90BE' }}>
            {vote.reason}
          </div>
        </div>

        {/* Weight + direction */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span style={{ color: voteColor }}>
            {isUp   ? <TrendingUp size={14} strokeWidth={2.5} />
             : isDown ? <TrendingDown size={14} strokeWidth={2.5} />
             : <Minus size={14} strokeWidth={2.5} />}
          </span>
          <div className="flex items-center gap-1">
            <div
              className="w-12 h-1.5 rounded-full overflow-hidden"
              style={{ background: '#18244a' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(vote.weight / 2.5) * 100}%`,
                  background: voteColor,
                }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold" style={{ color: '#7D90BE' }}>
              {vote.weight.toFixed(1)}×
            </span>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold transition-colors duration-150"
        style={{
          color: expanded ? voteColor : '#7D90BE',
          background: expanded ? badgeBg : 'transparent',
          borderTop: `1px solid ${rowBorder}`,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = badgeBg; }}
        onMouseLeave={(e) => { if (!expanded) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        {expanded ? 'Hide explanation' : 'What does this indicator measure?'}
      </button>

      {/* Expanded explanation */}
      {expanded && (
        <div
          className="px-3 pb-3 pt-2 space-y-2"
          style={{ borderTop: `1px solid ${rowBorder}`, background: badgeBg }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1" style={{ color: '#7D90BE' }}>
              What it measures
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: '#B3C2E8' }}>
              {info.what}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2" style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.15)' }}>
              <p className="text-[10px] font-bold mb-1" style={{ color: '#16a34a' }}>Bullish means</p>
              <p className="text-[11px] leading-relaxed" style={{ color: '#B3C2E8' }}>{info.bullishMeans}</p>
            </div>
            <div className="rounded-lg p-2" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
              <p className="text-[10px] font-bold mb-1" style={{ color: '#dc2626' }}>Bearish means</p>
              <p className="text-[11px] leading-relaxed" style={{ color: '#B3C2E8' }}>{info.bearishMeans}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


