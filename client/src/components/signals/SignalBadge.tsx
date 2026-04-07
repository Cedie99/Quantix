import type { SignalType } from '@/types';
import { SIGNAL_LABELS, SIGNAL_BG_COLORS, SIGNAL_TEXT_COLORS } from '@/constants';
import { cn } from '@/utils/cn';

interface Props {
  type: SignalType;
  size?: 'sm' | 'md' | 'lg';
}

export function SignalBadge({ type, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm font-semibold',
    lg: 'px-4 py-2 text-base font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border',
        SIGNAL_BG_COLORS[type],
        SIGNAL_TEXT_COLORS[type],
        sizeClasses[size]
      )}
    >
      {SIGNAL_LABELS[type]}
    </span>
  );
}
