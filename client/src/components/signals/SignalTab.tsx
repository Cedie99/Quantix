import { useState, useEffect } from 'react';
import { useSignalStore } from '@/stores/useSignalStore';
import { useChartStore } from '@/stores/useChartStore';
import { useAIStore } from '@/stores/useAIStore';
import { fetchAIAnalysis } from '@/services/api/aiAnalysis';
import { VoteBreakdown } from './VoteBreakdown';
import { SIGNAL_CONFIG } from './signalConfig';
import { cn } from '@/utils/cn';
import type { AIAnalysis } from '@/types';
import {
  Lightbulb, Target, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, Shield,
} from 'lucide-react';

export function SignalTab() {
  const signal = useSignalStore((s) => s.signal);
  const { symbol, timeframe, candles } = useChartStore();
  const { analysis, isLoading: aiLoading, setAnalysis, setLoading: setAiLoading, setError: setAiError } = useAIStore();
  const [aiExpanded, setAiExpanded] = useState(false);

  if (!signal) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm" style={{ color: '#7D90BE' }}>Waiting for signal…</span>
      </div>
    );
  }

  const cfg = SIGNAL_CONFIG[signal.type];

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

  return (
    <div className="flex flex-col gap-0">
      {/* Disclaimer strip */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ background: 'rgba(59,130,246,0.04)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}
      >
        <Shield size={10} style={{ color: '#3B82F6', flexShrink: 0 }} />
        <span className="text-[10px]" style={{ color: '#7D90BE' }}>
          Signal analysis only — not financial advice
        </span>
      </div>

      {/* Guidance card */}
      <div
        className="mx-4 my-3 rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${cfg.guidanceBorder}`, background: cfg.guidanceBg }}
      >
        <div className="px-4 py-3 flex items-start gap-3" style={{ borderBottom: `1px solid ${cfg.guidanceBorder}` }}>
          <div
            className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5"
            style={{ background: cfg.glowColor }}
          >
            <Lightbulb size={12} style={{ color: '#E8EFFF' }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: '#7D90BE' }}>
              What this means
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#B3C2E8' }}>{cfg.description}</p>
          </div>
        </div>
        <div className="px-4 py-3 flex items-start gap-3">
          <div
            className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <Target size={12} style={{ color: '#B3C2E8' }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: '#7D90BE' }}>
              What to consider
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#B3C2E8' }}>{cfg.guidance}</p>
          </div>
        </div>
      </div>

      {/* AI Section */}
      <AISection
        analysis={analysis}
        isLoading={aiLoading}
        expanded={aiExpanded}
        onToggle={() => setAiExpanded((v) => !v)}
        onRefresh={handleRefreshAI}
      />

      {/* Indicator breakdown */}
      <div className="px-4 py-4">
        <VoteBreakdown votes={signal.votes} />
      </div>
    </div>
  );
}

// ── AI Section (self-contained) ────────────────────────────────────────────────

const VERDICT_STYLES: Record<string, { color: string; bg: string; border: string; label: string; emoji: string }> = {
  CONFIRM_BUY:    { color: '#22c55e', bg: 'rgba(34,197,94,0.06)',   border: 'rgba(34,197,94,0.2)',    label: 'Confirms Buy',   emoji: '✓' },
  HOLD:           { color: '#94a3b8', bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.15)', label: 'Hold',           emoji: '◆' },
  CONFIRM_SELL:   { color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.2)',    label: 'Confirms Sell',  emoji: '✓' },
  CAUTION:        { color: '#eab308', bg: 'rgba(234,179,8,0.06)',   border: 'rgba(234,179,8,0.2)',    label: 'Caution',        emoji: '⚠' },
  STRONG_CAUTION: { color: '#f97316', bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.2)',   label: 'Strong Caution', emoji: '⚠' },
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
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ background: '#131d3d' }}
        onClick={onToggle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#18244a'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#131d3d'; }}
      >
        <div className="flex items-center gap-2">
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
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onRefresh(); }}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all duration-150 disabled:opacity-40"
            style={{ background: '#1c2a56', border: '1px solid #2A3F74', color: '#B3C2E8' }}
            onMouseEnter={(e) => { if (!isLoading) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#3B82F6'; } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A3F74'; }}
          >
            <RefreshCw size={9} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {expanded ? <ChevronUp size={13} style={{ color: '#7D90BE' }} /> : <ChevronDown size={13} style={{ color: '#7D90BE' }} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3" style={{ background: '#070b1a' }}>
          {isLoading && !analysis && (
            <div className="flex items-center gap-2 py-4 justify-center">
              <RefreshCw size={14} className="text-indigo-400 animate-spin" />
              <span className="text-xs" style={{ color: '#7D90BE' }}>Analyzing with AI model…</span>
            </div>
          )}
          {!isLoading && !analysis && (
            <div className="py-4 text-center">
              <p className="text-xs" style={{ color: '#7D90BE' }}>Click Refresh to run AI analysis.</p>
            </div>
          )}
          {analysis && vs && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${vs.border}`, background: vs.bg, opacity: isLoading ? 0.6 : 1 }}
            >
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${vs.border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: '#7D90BE' }}>Key Insight</p>
                <p className="text-sm leading-relaxed font-medium" style={{ color: '#E8EFFF' }}>"{analysis.keyInsight}"</p>
              </div>
              {analysis.risks.length > 0 && (
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${vs.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2 flex items-center gap-1" style={{ color: '#7D90BE' }}>
                    <AlertTriangle size={10} /> Risks
                  </p>
                  <ul className="space-y-1.5">
                    {analysis.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: '#B3C2E8' }}>
                        <span className="text-red-500/50 shrink-0 mt-0.5">•</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: '#7D90BE' }}>Summary</p>
                <p className="text-xs leading-relaxed" style={{ color: '#B3C2E8' }}>{analysis.contextSummary}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


