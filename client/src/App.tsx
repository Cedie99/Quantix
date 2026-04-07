import { AppLayout } from '@/components/layout/AppLayout';
import { useCandles } from '@/hooks/useCandles';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useIndicators } from '@/hooks/useIndicators';
import { useSignal } from '@/hooks/useSignal';
import { useRisk } from '@/hooks/useRisk';
import { useMarket } from '@/hooks/useMarket';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useSyncUserData } from '@/hooks/useSyncUserData';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';

function DataOrchestrator() {
  // These hooks wire up all data flows
  useCandles();         // Load historical candles on symbol/timeframe change
  useWebSocket();       // Live WebSocket updates
  useIndicators();      // Recalculate indicators when candles change
  useSignal();          // Generate signal + fire alerts
  useRisk();            // ATR-based risk calculations
  useMarket();          // Market overview + watchlist prices
  useAIAnalysis();      // Auto-trigger AI analysis on signal type change
  useSyncUserData();    // Sync store changes to backend
  usePriceAlerts();     // Watch prices and trigger custom price alerts
  return null;
}

export default function App() {
  return (
    <>
      <DataOrchestrator />
      <AppLayout />
    </>
  );
}
