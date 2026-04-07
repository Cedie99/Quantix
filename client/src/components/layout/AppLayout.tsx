import { useState } from 'react';
import { Header } from './Header';
import { RightPanel } from './RightPanel';
import { ChartContainer } from '@/components/chart/ChartContainer';
import { IndicatorValues } from '@/components/indicators/IndicatorValues';
import { WatchList } from '@/components/watchlist/WatchList';
import { MarketOverview } from '@/components/market/MarketOverview';
import { TopMovers } from '@/components/market/TopMovers';
import { MTFBar } from '@/components/mtf/MTFBar';
import { InfoModal } from '@/components/ui/InfoModal';

export function AppLayout() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div
      className="relative flex flex-col h-screen overflow-hidden"
      style={{
        background: 'radial-gradient(1000px 480px at -10% -20%, rgba(91,123,255,0.18), transparent 60%), radial-gradient(900px 420px at 110% -20%, rgba(139,125,255,0.14), transparent 60%), #070b1a',
      }}
    >
      <Header onInfoClick={() => setInfoOpen(true)} />

      <div className="flex flex-1 min-h-0 overflow-hidden gap-3 px-2 pb-2 sm:px-3 sm:pb-3 flex-col lg:flex-row">

        {/* Mobile quick sections */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            className="overflow-y-auto flex flex-col rounded-2xl max-h-56"
            style={{
              background: 'linear-gradient(180deg, rgba(10,16,36,0.95), rgba(9,14,31,0.95))',
              border: '1px solid rgba(42,63,116,0.65)',
              boxShadow: '0 14px 26px rgba(2,5,15,0.42)',
            }}
          >
            <WatchList />
          </div>
          <div
            className="overflow-y-auto flex flex-col rounded-2xl max-h-56"
            style={{
              background: 'linear-gradient(180deg, rgba(10,16,36,0.95), rgba(9,14,31,0.95))',
              border: '1px solid rgba(42,63,116,0.65)',
              boxShadow: '0 14px 26px rgba(2,5,15,0.42)',
            }}
          >
            <MarketOverview />
            <div style={{ borderTop: '1px solid rgba(42,63,116,0.65)' }}>
              <TopMovers />
            </div>
          </div>
        </div>

        {/* Left sidebar */}
        <aside
          className="hidden lg:flex w-56 xl:w-64 shrink-0 overflow-y-auto flex-col rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(10,16,36,0.95), rgba(9,14,31,0.95))',
            border: '1px solid rgba(42,63,116,0.65)',
            boxShadow: '0 20px 40px rgba(2,5,15,0.45)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <WatchList />
          <div style={{ borderTop: '1px solid rgba(42,63,116,0.65)' }}>
            <MarketOverview />
          </div>
          <div style={{ borderTop: '1px solid rgba(42,63,116,0.65)' }}>
            <TopMovers />
          </div>
        </aside>

        {/* Center: MTFBar + Chart + IndicatorValues */}
        <main
          className="flex-1 min-w-0 min-h-[52vh] lg:min-h-0 flex flex-col overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(11,18,40,0.92), rgba(9,14,33,0.92))',
            border: '1px solid rgba(42,63,116,0.7)',
            boxShadow: '0 24px 42px rgba(2,5,15,0.45)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <MTFBar />
          <div className="flex-1 min-h-0">
            <ChartContainer />
          </div>
          <div className="shrink-0" style={{ borderTop: '1px solid rgba(42,63,116,0.75)' }}>
            <IndicatorValues />
          </div>
        </main>

        {/* Right panel: tabbed */}
        <RightPanel />

      </div>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
