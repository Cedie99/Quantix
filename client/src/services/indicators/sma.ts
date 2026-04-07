import { SMA } from 'technicalindicators';

export function calculateSMA(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const result = SMA.calculate({ period, values });
  return result.length > 0 ? result[result.length - 1] : null;
}

export function calculateSMASeries(values: number[], period: number): number[] {
  if (values.length < period) return [];
  return SMA.calculate({ period, values });
}
