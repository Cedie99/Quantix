import { WatchList } from '@/components/watchlist/WatchList';
import { MarketOverview } from '@/components/market/MarketOverview';
import { TopMovers } from '@/components/market/TopMovers';

export function Sidebar() {
  return (
    <aside className="w-52 xl:w-60 shrink-0 bg-[hsl(222,47%,9%)] border-r border-[hsl(217,33%,17%)] flex flex-col overflow-y-auto">
      <WatchList />
      <div className="border-t border-[hsl(217,33%,17%)]" />
      <MarketOverview />
      <div className="border-t border-[hsl(217,33%,17%)]" />
      <TopMovers />
    </aside>
  );
}
