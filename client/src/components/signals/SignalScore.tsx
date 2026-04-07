import type { Signal } from '@/types';
import { cn } from '@/utils/cn';

interface Props {
  signal: Signal;
}

export function SignalScore({ signal }: Props) {
  const { score, confidence } = signal;
  const isPositive = score > 0;
  const isNegative = score < 0;

  const barWidth = Math.abs(score);
  const barColor = score >= 30 ? 'bg-green-500' : score <= -30 ? 'bg-red-500' : 'bg-yellow-500';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Score</span>
        <span
          className={cn(
            'text-lg font-bold tabular-nums',
            isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-yellow-400'
          )}
        >
          {score > 0 ? '+' : ''}{score}
        </span>
      </div>

      {/* Score bar */}
      <div className="relative h-2 bg-[hsl(217,33%,17%)] rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-1/2 w-px bg-gray-600 z-10" />
        {score > 0 ? (
          <div
            className={cn('absolute inset-y-0 left-1/2 rounded-full transition-all duration-500', barColor)}
            style={{ width: `${barWidth / 2}%` }}
          />
        ) : (
          <div
            className={cn('absolute inset-y-0 right-1/2 rounded-full transition-all duration-500', barColor)}
            style={{ width: `${barWidth / 2}%` }}
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Confidence</span>
        <span className="text-sm font-medium text-gray-200">{confidence}%</span>
      </div>
      <div className="h-1.5 bg-[hsl(217,33%,17%)] rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}
