import { calculateSMA } from './sma';
import { INDICATOR_MIN_CANDLES } from '@/constants';

export function calculateVolumeSMA(volumes: number[], period = 20): number | null {
  if (volumes.length < INDICATOR_MIN_CANDLES.VOLUME_SMA) return null;
  return calculateSMA(volumes, period);
}

export function getVolumeMultiplier(currentVolume: number, volumeSMA: number | null): number {
  if (volumeSMA === null || volumeSMA === 0) return 1;
  const ratio = currentVolume / volumeSMA;
  if (ratio >= 1.5) return 1.5;
  if (ratio <= 0.7) return 0.7;
  return 1;
}
