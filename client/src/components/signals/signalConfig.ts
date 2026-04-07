import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SignalType } from '@/types';

export interface SignalCfg {
  Icon: LucideIcon;
  label: string;
  headline: string;
  description: string;
  guidance: string;
  action: string;
  bannerBg: string;
  bannerBorder: string;
  textColor: string;
  scoreColor: string;
  scoreBarColor: string;
  actionBg: string;
  glowColor: string;
  guidanceBg: string;
  guidanceBorder: string;
  pulse: boolean;
}

export const SIGNAL_CONFIG: Record<SignalType, SignalCfg> = {
  STRONG_BUY: {
    Icon: TrendingUp,
    label: 'STRONG BUY',
    headline: 'The trend looks strongly bullish',
    description: 'Most technical indicators are pointing upward. The market is showing strong buying momentum — prices may continue to rise in the near term.',
    guidance: 'Consider looking for a buy opportunity using the trade levels below. Always set a stop-loss to cap your downside.',
    action: 'Copy Setup',
    bannerBg: 'bg-gradient-to-br from-green-500/16 via-emerald-500/10 to-transparent',
    bannerBorder: 'border-b border-green-400/35',
    textColor: 'text-green-300',
    scoreColor: 'text-green-300',
    scoreBarColor: 'bg-gradient-to-r from-green-400 to-green-600',
    actionBg: 'bg-green-500 hover:bg-green-400',
    glowColor: 'rgba(22,163,74,0.15)',
    guidanceBg: 'rgba(22,163,74,0.12)',
    guidanceBorder: 'rgba(74,222,128,0.28)',
    pulse: true,
  },
  BUY: {
    Icon: TrendingUp,
    label: 'BUY',
    headline: 'The trend looks moderately bullish',
    description: 'Several indicators lean upward. The market is showing moderate buying pressure — conditions look generally favorable.',
    guidance: 'A cautious buy may be reasonable. Consider starting with a smaller position and always set a stop-loss to protect yourself.',
    action: 'Copy Setup',
    bannerBg: 'bg-gradient-to-br from-green-500/14 via-emerald-500/8 to-transparent',
    bannerBorder: 'border-b border-green-400/25',
    textColor: 'text-green-300',
    scoreColor: 'text-green-300',
    scoreBarColor: 'bg-gradient-to-r from-green-300 to-green-500',
    actionBg: 'bg-green-500 hover:bg-green-400',
    glowColor: 'rgba(22,163,74,0.1)',
    guidanceBg: 'rgba(22,163,74,0.1)',
    guidanceBorder: 'rgba(74,222,128,0.22)',
    pulse: false,
  },
  NEUTRAL: {
    Icon: Activity,
    label: 'NEUTRAL',
    headline: 'No clear trend right now',
    description: 'Indicators are mixed or conflicting. The market is in a period of indecision — there is no strong signal pointing in either direction.',
    guidance: 'Waiting is often the smartest move here. Hold off on new trades until a clearer direction emerges.',
    action: 'Wait',
    bannerBg: 'bg-gradient-to-br from-amber-500/14 via-yellow-500/8 to-transparent',
    bannerBorder: 'border-b border-amber-400/30',
    textColor: 'text-amber-300',
    scoreColor: 'text-amber-300',
    scoreBarColor: 'bg-gradient-to-r from-amber-300 to-amber-500',
    actionBg: 'bg-amber-500 hover:bg-amber-400',
    glowColor: 'rgba(217,119,6,0.12)',
    guidanceBg: 'rgba(217,119,6,0.1)',
    guidanceBorder: 'rgba(251,191,36,0.24)',
    pulse: false,
  },
  SELL: {
    Icon: TrendingDown,
    label: 'SELL',
    headline: 'The trend looks moderately bearish',
    description: 'Several indicators lean downward. The market is showing moderate selling pressure — conditions look unfavorable for long positions.',
    guidance: 'Consider reducing long positions or waiting. If you are already in a trade, watch your stop-loss closely.',
    action: 'Copy Setup',
    bannerBg: 'bg-gradient-to-br from-red-500/14 via-rose-500/8 to-transparent',
    bannerBorder: 'border-b border-red-400/25',
    textColor: 'text-red-300',
    scoreColor: 'text-red-300',
    scoreBarColor: 'bg-gradient-to-l from-red-300 to-red-500',
    actionBg: 'bg-red-500 hover:bg-red-400',
    glowColor: 'rgba(220,38,38,0.1)',
    guidanceBg: 'rgba(220,38,38,0.1)',
    guidanceBorder: 'rgba(248,113,113,0.22)',
    pulse: false,
  },
  STRONG_SELL: {
    Icon: TrendingDown,
    label: 'STRONG SELL',
    headline: 'The trend looks strongly bearish',
    description: 'Most technical indicators are pointing downward. The market is showing strong selling momentum — prices may continue to fall in the near term.',
    guidance: 'Consider exiting long positions or looking for a short opportunity. Use the trade levels below to manage your risk.',
    action: 'Copy Setup',
    bannerBg: 'bg-gradient-to-br from-red-500/16 via-rose-500/10 to-transparent',
    bannerBorder: 'border-b border-red-400/35',
    textColor: 'text-red-300',
    scoreColor: 'text-red-300',
    scoreBarColor: 'bg-gradient-to-l from-red-400 to-red-600',
    actionBg: 'bg-red-500 hover:bg-red-400',
    glowColor: 'rgba(220,38,38,0.15)',
    guidanceBg: 'rgba(220,38,38,0.12)',
    guidanceBorder: 'rgba(248,113,113,0.3)',
    pulse: true,
  },
};
