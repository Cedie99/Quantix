import { useState, useEffect } from 'react';
import { useSignalStore } from '@/stores/useSignalStore';
import { useRiskStore } from '@/stores/useRiskStore';
import { useChartStore } from '@/stores/useChartStore';
import { useAIStore } from '@/stores/useAIStore';
import { fetchAIAnalysis } from '@/services/api/aiAnalysis';
import { VoteBreakdown } from './VoteBreakdown';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { AIAnalysis } from '@/types';
import {
  Copy, Check, Clock,
  HelpCircle, RefreshCw, ChevronDown, ChevronUp, Shield,
  AlertTriangle, Lightbulb, Target, Ban, Activity,
} from 'lucide-react';
import { SIGNAL_CONFIG } from './signalConfig';

// ─── Trade level tooltip descriptions ─────────────────────────────────────────

const LEVEL_TOOLTIPS = {
  entry: 'The suggested price to enter the trade based on the current market price.',
  stop: 'Exit here if the trade goes against you. This limits your maximum loss.',
  tp1: '2:1 reward-to-risk target — a good first take-profit level.',
  tp2: '3:1 reward-to-risk target — if the trend continues strongly.',
};

// ─── Main component ────────────────────────────────────────────────────────────

export function SignalPanel({ onInfoClick }: { onInfoClick?: () => void }) {
  const { signal } = useSignalStore();
  const { risk } = useRiskStore();
  const { symbol, timeframe, candles } = useChartStore();
  const { analysis, isLoading: aiLoading, setAnalysis, setLoading: setAiLoading, setError: setAiError } = useAIStore();

  const [setupCopied, setSetupCopied] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);

  // Animate score bar on mount / signal change
  const [scoreVisible, setScoreVisible] = useState(false);
  useEffect(() => {
    setScoreVisible(false);
    const t = setTimeout(() => setScoreVisible(true), 80);
    return () => clearTimeout(t);
  }, [signal?.type]);

  // ── AI refresh handler ─────────────────────────────────────────────────────
  const handleRefreshAI = async () => {
    if (!signal || candles.length === 0 || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const price = candles[candles.length - 1].close;
      const result = await fetchAIAnalysis(symbol, timeframe, price, signal);
      setAnalysis({ ...result, timestamp: Date.now() });
    } catch {
      setAiError('AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (!signal) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5">
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full border-2 animate-spin"
            style={{ borderColor: '#2A3F74', borderTopColor: '#3B82F6' }}
          />
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ border: '2px solid #3B82F6', opacity: 0.15 }}
          />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-sm font-semibold" style={{ color: '#B3C2E8' }}>Analyzing market conditions</p>
          <p className="text-xs" style={{ color: '#7D90BE' }}>Fetching price data and calculating indicators…</p>
        </div>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const cfg = SIGNAL_CONFIG[signal.type];
  const isSell = signal.type === 'SELL' || signal.type === 'STRONG_SELL';
  const isNeutral = signal.type === 'NEUTRAL';
  const absScore = Math.abs(signal.score);

  const bullishVotes = signal.votes.filter((v) => v.vote === 1).length;
  const bearishVotes = signal.votes.filter((v) => v.vote === -1).length;
  const total = signal.votes.length;
  const agreementCount = isSell ? bearishVotes : bullishVotes;

  const confidenceLabel =
    signal.confidence >= 75 ? 'High' : signal.confidence >= 50 ? 'Moderate' : 'Low';
  const confidenceColor =
    signal.confidence >= 75 ? '#22c55e' : signal.confidence >= 50 ? '#eab308' : '#ef4444';

  const secondsAgo = Math.floor((Date.now() - signal.timestamp) / 1000);
  const timeAgo = secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`;

  const displaySymbol = symbol.replace('USDT', '');

  let tradeLevels: { entry: number; stopLoss: number; tp1: number; tp2: number } | null = null;
  if (risk && !isNeutral) {
    const entry = risk.entryPrice;
    const dist = risk.stopDistance;
    tradeLevels = isSell
      ? { entry, stopLoss: entry + dist, tp1: entry - dist * 2, tp2: entry - dist * 3 }
      : { entry, stopLoss: entry - dist, tp1: entry + dist * 2, tp2: entry + dist * 3 };
  }

  // ── Copy setup ─────────────────────────────────────────────────────────────

  const handleCopySetup = () => {
    if (!tradeLevels || isNeutral) return;
    const pair = `${displaySymbol}/USDT`;
    const lines = [
      `${cfg.label} — ${pair}`,
      `Entry:    $${formatPrice(tradeLevels.entry)}`,
      `Stop:     $${formatPrice(tradeLevels.stopLoss)}`,
      `Target 1: $${formatPrice(tradeLevels.tp1)}`,
      `Target 2: $${formatPrice(tradeLevels.tp2)}`,
      `Confidence: ${signal.confidence}%`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setSetupCopied(true);
      setTimeout(() => setSetupCopied(false), 2000);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">

      {/* ── Disclaimer strip ──────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-2 gap-3"
        style={{ background: 'rgba(59,130,246,0.04)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}
      >
        <div className="flex items-center gap-2">
          <Shield size={11} style={{ color: '#3B82F6', flexShrink: 0 }} />
          <span className="text-[11px]" style={{ color: '#7D90BE' }}>
            Signal analysis only — not financial advice, not a trading bot
          </span>
        </div>
        {onInfoClick && (
          <button
            onClick={onInfoClick}
            className="flex items-center gap-1 text-[11px] font-semibold shrink-0 transition-colors duration-150"
            style={{ color: '#3B82F6' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#3B82F6'; }}
          >
            <HelpCircle size={11} />
            Learn more
          </button>
        )}
      </div>

      {/* ── Signal hero ───────────────────────────────────────────────────── */}
      <div className={cn('relative overflow-hidden', cfg.bannerBg, cfg.bannerBorder)}>
        {/* Tint overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(245,247,255,0.3)' }} />
        {/* Glow blob */}
        <div
          className="absolute -top-10 -left-10 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: cfg.glowColor, filter: 'blur(50px)', opacity: 0.5 }}
        />
        {/* Watermark icon */}
        <cfg.Icon
          className={cn('absolute right-4 top-1/2 -translate-y-1/2 select-none pointer-events-none', cfg.textColor)}
          size={120}
          strokeWidth={0.8}
          style={{ opacity: 0.04 }}
        />

        <div className="relative px-6 py-6">
          <div className="flex items-start justify-between gap-4">

            {/* Left: icon + label + headline */}
            <div className="flex items-start gap-4 min-w-0">
              <div
                className="shrink-0 w-13 h-13 rounded-2xl flex items-center justify-center mt-0.5"
                style={{
                  background: 'rgba(7,11,20,0.6)',
                  border: `1px solid ${cfg.glowColor}`,
                  width: 52,
                  height: 52,
                  boxShadow: `0 0 20px ${cfg.glowColor}`,
                }}
              >
                <cfg.Icon
                  className={cn(cfg.textColor, cfg.pulse && 'animate-pulse')}
                  size={26}
                  strokeWidth={2.5}
                />
              </div>
              <div className="min-w-0">
                <div className={cn('text-2xl font-black tracking-tight leading-none', cfg.textColor)}>
                  {cfg.label}
                </div>
                <div className="flex items-center gap-1.5 mt-1 mb-2.5">
                  <span className="text-xs font-bold" style={{ color: '#7D90BE' }}>
                    {displaySymbol}/USDT
                  </span>
                  <span style={{ color: '#7D90BE' }}>·</span>
                  {!isNeutral ? (
                    <span className="text-xs" style={{ color: '#B3C2E8' }}>
                      {agreementCount} of {total} indicators agree
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: '#B3C2E8' }}>
                      Mixed signals
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold leading-snug" style={{ color: '#E8EFFF' }}>
                  {cfg.headline}
                </p>
              </div>
            </div>

            {/* Right: copy button + time */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {!isNeutral ? (
                <button
                  onClick={handleCopySetup}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg active:scale-95',
                    cfg.actionBg,
                  )}
                >
                  {setupCopied
                    ? <><Check size={13} strokeWidth={2.5} /> Copied!</>
                    : <><Copy size={12} strokeWidth={2} /> {cfg.action}</>}
                </button>
              ) : (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold tracking-wide"
                  style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.2)' }}
                >
                  <Ban size={13} strokeWidth={2} />
                  Hold off for now
                </div>
              )}
              <div className="flex items-center gap-1" style={{ color: '#7D90BE' }}>
                <Clock size={10} />
                <span className="text-[10px] font-medium">{timeAgo}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Guidance card ─────────────────────────────────────────────────── */}
      <div
        className="mx-5 my-4 rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${cfg.guidanceBorder}`, background: cfg.guidanceBg }}
      >
        {/* What this means */}
        <div className="px-4 py-3.5 flex items-start gap-3" style={{ borderBottom: `1px solid ${cfg.guidanceBorder}` }}>
          <div
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
            style={{ background: `${cfg.glowColor}`, opacity: 1 }}
          >
            <Lightbulb size={13} style={{ color: '#E8EFFF' }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: '#7D90BE' }}>
              What this means
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#B3C2E8' }}>
              {cfg.description}
            </p>
          </div>
        </div>
        {/* What to consider */}
        <div className="px-4 py-3.5 flex items-start gap-3">
          <div
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <Target size={13} style={{ color: '#B3C2E8' }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: '#7D90BE' }}>
              What to consider
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#B3C2E8' }}>
              {cfg.guidance}
            </p>
          </div>
        </div>
      </div>

      {/* ── Score + Confidence ─────────────────────────────────────────────── */}
      <div
        className="px-5 pb-5 grid grid-cols-2 gap-5"
        style={{ borderBottom: '1px solid #2A3F74' }}
      >

        {/* Signal Strength */}
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>
              Signal Strength
            </span>
            <span className={cn('text-3xl font-black tabular-nums leading-none', cfg.scoreColor)}>
              {signal.score > 0 ? '+' : ''}{signal.score}
            </span>
          </div>
          <div
            className="relative h-3 rounded-full overflow-hidden"
            style={{ background: '#18244a', border: '1px solid #2A3F74' }}
          >
            <div className="absolute inset-y-0 left-1/2 w-px z-10" style={{ background: '#7D90BE' }} />
            {signal.score >= 0 ? (
              <div
                className={cn('absolute inset-y-0 left-1/2 rounded-r-full transition-all duration-700', cfg.scoreBarColor)}
                style={{
                  width: scoreVisible ? `${absScore / 2}%` : '0%',
                  boxShadow: `0 0 10px ${cfg.glowColor}`,
                }}
              />
            ) : (
              <div
                className={cn('absolute inset-y-0 right-1/2 rounded-l-full transition-all duration-700', cfg.scoreBarColor)}
                style={{
                  width: scoreVisible ? `${absScore / 2}%` : '0%',
                  boxShadow: `0 0 10px ${cfg.glowColor}`,
                }}
              />
            )}
          </div>
          <div className="flex justify-between text-[10px] font-mono" style={{ color: '#7D90BE' }}>
            <span>← Bearish</span>
            <span>Bullish →</span>
          </div>
        </div>

        {/* Confidence */}
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>
              Confidence
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold" style={{ color: confidenceColor }}>{confidenceLabel}</span>
              <span className="text-3xl font-black tabular-nums leading-none" style={{ color: '#E8EFFF' }}>
                {signal.confidence}%
              </span>
            </div>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: '#18244a', border: '1px solid #2A3F74' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: scoreVisible ? `${signal.confidence}%` : '0%',
                background: `linear-gradient(to right, rgba(${
                  signal.confidence >= 70
                    ? '34,197,94'
                    : signal.confidence >= 45
                    ? '234,179,8'
                    : '239,68,68'
                },0.4), ${confidenceColor})`,
                boxShadow: `0 0 10px ${confidenceColor}40`,
              }}
            />
          </div>
          <p className="text-[10px]" style={{ color: '#7D90BE' }}>
            {signal.confidence >= 75
              ? 'Most indicators strongly agree'
              : signal.confidence >= 50
              ? 'Several indicators agree'
              : 'Weak agreement — trade with extra caution'}
          </p>
        </div>
      </div>

      {/* ── Trade Levels ───────────────────────────────────────────────────── */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #2A3F74' }}>
        <div className="flex items-center justify-between mb-3.5">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>
            {isSell ? 'Short Trade Levels' : isNeutral ? 'Trade Levels' : 'Long Trade Levels'}
          </h4>
          <TradeLevelHelp />
        </div>

        {isNeutral ? (
          <div
            className="rounded-2xl px-5 py-6 text-center"
            style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.15)' }}
          >
            <Activity size={22} className="mx-auto mb-2.5 text-yellow-500/50" />
            <p className="text-sm font-semibold text-yellow-500/70">No active trade setup</p>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#7D90BE' }}>
              Wait for a directional signal before looking at trade levels.
              A NEUTRAL signal means the market has not chosen a side yet.
            </p>
          </div>
        ) : tradeLevels ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl overflow-hidden"
            style={{ border: '1px solid #2A3F74' }}
          >
            <TradeCell
              label={isSell ? 'Sell At' : 'Buy At'}
              value={`$${formatPrice(tradeLevels.entry)}`}
              sub="Entry"
              tooltip={LEVEL_TOOLTIPS.entry}
              valueColor="text-slate-100"
              bgStyle={{ background: '#131d3d' }}
              topBorderColor="#7D90BE"
            />
            <TradeCell
              label="Stop Loss"
              value={`$${formatPrice(tradeLevels.stopLoss)}`}
              sub="If wrong — exit here"
              tooltip={LEVEL_TOOLTIPS.stop}
              valueColor="text-red-400"
              bgStyle={{ background: 'rgba(239,68,68,0.05)' }}
              topBorderColor="#ef4444"
              divider
            />
            <TradeCell
              label="Target 1"
              value={`$${formatPrice(tradeLevels.tp1)}`}
              sub="2× reward"
              tooltip={LEVEL_TOOLTIPS.tp1}
              valueColor="text-green-400"
              bgStyle={{ background: 'rgba(34,197,94,0.04)' }}
              topBorderColor="#22c55e"
              divider
            />
            <TradeCell
              label="Target 2"
              value={`$${formatPrice(tradeLevels.tp2)}`}
              sub="3× reward"
              tooltip={LEVEL_TOOLTIPS.tp2}
              valueColor="text-green-600"
              bgStyle={{ background: 'rgba(34,197,94,0.06)' }}
              topBorderColor="#22c55e"
              divider
            />
          </div>
        ) : (
          <div
            className="rounded-2xl px-5 py-5 text-center"
            style={{ border: '1px solid #2A3F74', background: '#131d3d' }}
          >
            <p className="text-xs" style={{ color: '#7D90BE' }}>
              Set your trading budget in the right panel to see trade levels.
            </p>
          </div>
        )}

        {tradeLevels && !isNeutral && (
          <p className="text-[10px] mt-2.5 text-center" style={{ color: '#7D90BE' }}>
            Click any price to copy it · Levels calculated using ATR-based volatility
          </p>
        )}
      </div>

      {/* ── AI Analysis ───────────────────────────────────────────────────── */}
      <AISection
        analysis={analysis}
        isLoading={aiLoading}
        expanded={aiExpanded}
        onToggle={() => setAiExpanded((v) => !v)}
        onRefresh={handleRefreshAI}
      />

      {/* ── Indicator breakdown ───────────────────────────────────────────── */}
      <div className="px-5 py-5">
        <VoteBreakdown votes={signal.votes} />
      </div>

    </div>
  );
}

// ─── Trade level help tooltip ──────────────────────────────────────────────────

function TradeLevelHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] font-semibold transition-colors duration-150"
        style={{ color: open ? '#60a5fa' : '#7D90BE' }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.color = '#B3C2E8'; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.color = '#7D90BE'; }}
      >
        <HelpCircle size={11} />
        How are these calculated?
      </button>
      {open && (
        <div
          className="absolute right-0 top-6 z-30 w-72 rounded-2xl p-4 space-y-3 shadow-2xl"
          style={{
            background: '#131d3d',
            border: '1px solid #2A3F74',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent rounded-t-2xl" />
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>
            Trade Level Explanation
          </p>
          {[
            { label: 'Entry', color: '#B3C2E8', desc: LEVEL_TOOLTIPS.entry },
            { label: 'Stop Loss', color: '#ef4444', desc: LEVEL_TOOLTIPS.stop },
            { label: 'Target 1', color: '#22c55e', desc: LEVEL_TOOLTIPS.tp1 },
            { label: 'Target 2', color: '#4ade80', desc: LEVEL_TOOLTIPS.tp2 },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <span className="text-[11px] font-bold shrink-0 w-16" style={{ color: item.color }}>{item.label}</span>
              <p className="text-[11px] leading-relaxed" style={{ color: '#B3C2E8' }}>{item.desc}</p>
            </div>
          ))}
          <button
            onClick={() => setOpen(false)}
            className="text-[10px] font-semibold mt-1 block text-right w-full"
            style={{ color: '#7D90BE' }}
          >
            Close ×
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Trade cell ────────────────────────────────────────────────────────────────

function TradeCell({
  label, value, sub, tooltip, valueColor, bgStyle, topBorderColor, divider = false,
}: {
  label: string;
  value: string;
  sub: string;
  tooltip: string;
  valueColor: string;
  bgStyle: React.CSSProperties;
  topBorderColor: string;
  divider?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showTip, setShowTip] = useState(false);

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
      title="Click to copy"
      className="group relative flex flex-col items-center justify-center px-3 py-5 text-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-95"
      style={{
        ...bgStyle,
        borderTop: `2px solid ${topBorderColor}`,
        ...(divider ? { borderLeft: '1px solid #2A3F74' } : {}),
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.15)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1)';
      }}
    >
      <span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>
        {label}
      </span>
      <span className={cn('text-sm font-black font-mono tabular-nums transition-all leading-snug', valueColor)}>
        {copied ? (
          <span className="flex items-center gap-1 text-sm text-green-400">
            <Check size={12} strokeWidth={2.5} /> Copied
          </span>
        ) : value}
      </span>
      <span className="text-[10px] leading-tight text-center" style={{ color: '#7D90BE' }}>{sub}</span>
      <Copy
        size={9}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity"
        style={{ color: '#B3C2E8' }}
      />
    </div>
  );
}

// ─── AI analysis section ───────────────────────────────────────────────────────

const VERDICT_STYLES: Record<string, { color: string; bg: string; border: string; label: string; emoji: string }> = {
  CONFIRM_BUY:    { color: '#22c55e', bg: 'rgba(34,197,94,0.06)',   border: 'rgba(34,197,94,0.2)',   label: 'Confirms Buy',    emoji: '✓' },
  HOLD:           { color: '#94a3b8', bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.15)', label: 'Hold',            emoji: '◆' },
  CONFIRM_SELL:   { color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.2)',   label: 'Confirms Sell',   emoji: '✓' },
  CAUTION:        { color: '#eab308', bg: 'rgba(234,179,8,0.06)',   border: 'rgba(234,179,8,0.2)',   label: 'Caution',         emoji: '⚠' },
  STRONG_CAUTION: { color: '#f97316', bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.2)',  label: 'Strong Caution',  emoji: '⚠' },
};

function AISection({
  analysis, isLoading, expanded, onToggle, onRefresh,
}: {
  analysis: AIAnalysis | null;
  isLoading: boolean;
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}) {
  const vs = analysis ? VERDICT_STYLES[analysis.verdict] : null;

  return (
    <div style={{ borderBottom: '1px solid #2A3F74' }}>
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-3 cursor-pointer transition-all duration-150"
        style={{ background: '#131d3d' }}
        onClick={onToggle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#18244a'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#131d3d'; }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            {isLoading
              ? <RefreshCw size={10} className="text-indigo-400 animate-spin" />
              : <span className="text-[10px]" style={{ color: '#6366F1' }}>AI</span>}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>
            AI Context Analysis
          </span>
          {analysis && vs && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: vs.bg, color: vs.color, border: `1px solid ${vs.border}` }}
            >
              {vs.emoji} {vs.label}
            </span>
          )}
          {!analysis && !isLoading && (
            <span className="text-[10px]" style={{ color: '#7D90BE' }}>Not loaded yet</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onRefresh(); }}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-150 disabled:opacity-40"
            style={{ background: '#1c2a56', border: '1px solid #2A3F74', color: '#B3C2E8' }}
            onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.borderColor = '#3B82F6'; (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A3F74'; (e.currentTarget as HTMLButtonElement).style.color = '#B3C2E8'; }}
          >
            <RefreshCw size={9} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {expanded ? <ChevronUp size={13} style={{ color: '#7D90BE' }} /> : <ChevronDown size={13} style={{ color: '#7D90BE' }} />}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 space-y-3.5" style={{ background: '#070b1a' }}>
          {isLoading && !analysis && (
            <div className="flex items-center gap-2.5 py-4 justify-center">
              <RefreshCw size={14} className="text-indigo-400 animate-spin" />
              <span className="text-xs" style={{ color: '#7D90BE' }}>Analyzing with AI model…</span>
            </div>
          )}

          {!isLoading && !analysis && (
            <div className="py-4 text-center">
              <p className="text-xs" style={{ color: '#7D90BE' }}>
                AI analysis runs automatically when the signal type changes.
              </p>
              <button
                onClick={onRefresh}
                className="mt-2 text-xs font-semibold transition-colors duration-150"
                style={{ color: '#3B82F6' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#3B82F6'; }}
              >
                Run analysis now
              </button>
            </div>
          )}

          {analysis && vs && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${vs.border}`, background: vs.bg, opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.3s' }}
            >
              {/* Key insight */}
              <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${vs.border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: '#7D90BE' }}>
                  Key Insight
                </p>
                <p className="text-sm leading-relaxed font-medium" style={{ color: '#E8EFFF' }}>
                  "{analysis.keyInsight}"
                </p>
              </div>

              {/* Risks */}
              {analysis.risks.length > 0 && (
                <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${vs.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2 flex items-center gap-1.5" style={{ color: '#7D90BE' }}>
                    <AlertTriangle size={10} /> Risks to Watch
                  </p>
                  <ul className="space-y-1.5">
                    {analysis.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: '#B3C2E8' }}>
                        <span className="text-red-500/50 shrink-0 mt-0.5">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary */}
              <div className="px-4 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: '#7D90BE' }}>
                  Context Summary
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#B3C2E8' }}>
                  {analysis.contextSummary}
                </p>
                <p className="text-[10px] text-right mt-2" style={{ color: '#7D90BE' }}>
                  {Math.floor((Date.now() - analysis.timestamp) / 1000)}s ago
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


