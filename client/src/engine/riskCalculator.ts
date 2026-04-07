import type { RiskManagement } from '@/types';
import { RISK_DEFAULTS } from '@/constants';

export function calculateRisk(
  entryPrice: number,
  atr: number | null,
  accountSize: number = RISK_DEFAULTS.accountSize,
  riskPercent: number = RISK_DEFAULTS.riskPercent,
  atrMultiplier: number = RISK_DEFAULTS.atrMultiplier
): RiskManagement | null {
  if (atr === null || atr <= 0 || entryPrice <= 0) return null;

  const stopDistance = atr * atrMultiplier;
  const stopLoss = entryPrice - stopDistance;
  const takeProfit2R = entryPrice + stopDistance * 2;
  const takeProfit3R = entryPrice + stopDistance * 3;
  const riskAmountUSD = accountSize * (riskPercent / 100);
  const positionSize = riskAmountUSD / stopDistance;
  const positionSizeUSD = positionSize * entryPrice;

  return {
    entryPrice,
    stopLoss,
    takeProfit2R,
    takeProfit3R,
    stopDistance,
    positionSize,
    positionSizeUSD,
    riskAmountUSD,
  };
}
