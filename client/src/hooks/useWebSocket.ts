import { useEffect } from 'react';
import { wsManager } from '@/services/websocket/wsManager';
import { useChartStore } from '@/stores/useChartStore';
import type { Candle } from '@/types';

export function useWebSocket() {
  const { symbol, timeframe, appendCandle } = useChartStore();

  useEffect(() => {
    const handleCandle = (candle: Candle) => {
      appendCandle(candle);
    };

    wsManager.connect(symbol, timeframe, handleCandle);

    return () => {
      wsManager.disconnect();
    };
  }, [symbol, timeframe, appendCandle]);
}
