import { useAIStore } from '@/stores/useAIStore';
import { cn } from '@/utils/cn';
import type { AIAnalysis } from '@/types';

type Verdict = AIAnalysis['verdict'];
type ConfidenceModifier = AIAnalysis['confidenceModifier'];

const VERDICT_CONFIG: Record<Verdict, {
  label: string;
  icon: string;
  border: string;
  bg: string;
  textColor: string;
}> = {
  CONFIRM_BUY: {
    label: 'CONFIRMS BUY',
    icon: '✓',
    border: 'border-green-500/50',
    bg: 'bg-green-500/5',
    textColor: 'text-green-400',
  },
  HOLD: {
    label: 'HOLD',
    icon: '◆',
    border: 'border-gray-600/50',
    bg: 'bg-gray-800/30',
    textColor: 'text-gray-400',
  },
  CONFIRM_SELL: {
    label: 'CONFIRMS SELL',
    icon: '✓',
    border: 'border-red-500/50',
    bg: 'bg-red-500/5',
    textColor: 'text-red-400',
  },
  CAUTION: {
    label: 'CAUTION',
    icon: '⚠',
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/5',
    textColor: 'text-yellow-400',
  },
  STRONG_CAUTION: {
    label: 'STRONG CAUTION',
    icon: '⚠',
    border: 'border-orange-500/50',
    bg: 'bg-orange-500/5',
    textColor: 'text-orange-400',
  },
};

const MODIFIER_CONFIG: Record<ConfidenceModifier, { label: string; color: string }> = {
  BOOST:   { label: 'BOOST confidence',  color: 'text-green-400' },
  NEUTRAL: { label: 'NEUTRAL confidence', color: 'text-gray-400' },
  REDUCE:  { label: 'REDUCE confidence', color: 'text-red-400'   },
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function AIAnalysisPanel({ onRefresh }: { onRefresh: () => void }) {
  const { analysis, isLoading, error } = useAIStore();

  return (
    <div className="border-t border-neutral-800 pt-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          AI Analysis
        </h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40"
        >
          <span className={cn('text-sm', isLoading && 'animate-spin')}>↺</span>
          Refresh
        </button>
      </div>

      {isLoading && !analysis && (
        <div className="flex items-center justify-center gap-2 py-6">
          <div className="w-4 h-4 rounded-full border-2 border-neutral-800 border-t-neutral-400 animate-spin" />
          <span className="text-xs text-gray-500">Analyzing with AI...</span>
        </div>
      )}

      {error && !analysis && (
        <div className="text-xs text-red-400 text-center py-3">{error}</div>
      )}

      {analysis && (() => {
        const vcfg = VERDICT_CONFIG[analysis.verdict];
        const mcfg = MODIFIER_CONFIG[analysis.confidenceModifier];
        return (
          <div className={cn(
            'rounded-xl border p-3 space-y-2.5 transition-all duration-300',
            vcfg.border,
            vcfg.bg,
            isLoading && 'opacity-60',
          )}>
            {/* Verdict + modifier row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-sm font-bold', vcfg.textColor)}>
                {vcfg.icon} {vcfg.label}
              </span>
              <span className="text-gray-600">·</span>
              <span className={cn('text-[13px] font-semibold', mcfg.color)}>
                {mcfg.label}
              </span>
            </div>

            {/* Key insight */}
            <div>
              <p className="text-[12px] text-gray-500 uppercase tracking-wider mb-1">Key Insight</p>
              <p className="text-xs text-gray-200 leading-relaxed">
                "{analysis.keyInsight}"
              </p>
            </div>

            {/* Risks */}
            {analysis.risks.length > 0 && (
              <div>
                <p className="text-[12px] text-gray-500 uppercase tracking-wider mb-1">⚠ Risks</p>
                <ul className="space-y-0.5">
                  {analysis.risks.map((risk, i) => (
                    <li key={i} className="text-xs text-gray-400 flex gap-1.5">
                      <span className="text-gray-600 flex-shrink-0">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Context summary */}
            <div>
              <p className="text-[12px] text-gray-500 uppercase tracking-wider mb-1">Summary</p>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                {analysis.contextSummary}
              </p>
            </div>

            {/* Timestamp */}
            <p className="text-[12px] text-gray-600 text-right">
              {timeAgo(analysis.timestamp)}
            </p>
          </div>
        );
      })()}
    </div>
  );
}
