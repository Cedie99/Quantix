import { useState } from 'react';
import { SignalHero } from '@/components/signals/SignalHero';
import { SignalTab } from '@/components/signals/SignalTab';
import { TradeTab } from '@/components/signals/TradeTab';
import { JournalTab } from '@/components/journal/JournalTab';
import { PriceAlertsTab } from '@/components/alerts/PriceAlertsTab';
import { cn } from '@/utils/cn';

type Tab = 'signal' | 'trade' | 'journal' | 'alerts';

const TABS: { id: Tab; label: string }[] = [
  { id: 'signal', label: 'Signal' },
  { id: 'trade', label: 'Trade' },
  { id: 'journal', label: 'Journal' },
  { id: 'alerts', label: 'Alerts' },
];

export function RightPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('signal');

  return (
    <aside
      className="w-full lg:w-92.5 shrink-0 flex flex-col overflow-hidden rounded-2xl lg:max-h-none"
      style={{
        background: 'linear-gradient(180deg, rgba(12,19,41,0.94), rgba(9,14,31,0.94))',
        border: '1px solid rgba(42,63,116,0.75)',
        boxShadow: '0 22px 38px rgba(2,5,15,0.5)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {/* SignalHero — always visible (~110px) */}
      <SignalHero />

      {/* Tab bar */}
      <div
        className="flex shrink-0"
        style={{ borderBottom: '1px solid #2A3F74', background: 'rgba(11,18,40,0.9)' }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 text-xs font-bold transition-all duration-200 relative"
              style={{
                color: active ? '#E8EFFF' : '#7D90BE',
                background: active ? 'rgba(91,123,255,0.16)' : 'transparent',
              }}
            >
              {tab.label}
              {active && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #5B7BFF, #8B7DFF)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content — scrollable */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'signal' && <SignalTab />}
        {activeTab === 'trade' && <TradeTab />}
        {activeTab === 'journal' && <JournalTab />}
        {activeTab === 'alerts' && <PriceAlertsTab />}
      </div>
    </aside>
  );
}
