import { useState } from 'react';
import { usePriceAlertStore } from '@/stores/usePriceAlertStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useChartStore } from '@/stores/useChartStore';
import { formatPrice } from '@/utils/format';
import { Bell, BellOff, Plus, X, Trash2 } from 'lucide-react';

export function PriceAlertsTab() {
  const { priceAlerts, addPriceAlert, removePriceAlert, clearTriggered } = usePriceAlertStore();
  const items = useWatchlistStore((s) => s.items);
  const currentSymbol = useChartStore((s) => s.symbol);

  const [symbol, setSymbol] = useState(currentSymbol);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  const handleAdd = () => {
    const targetPrice = parseFloat(price);
    if (!symbol || !targetPrice) return;
    addPriceAlert({ symbol, targetPrice, condition });
    setPrice('');
  };

  const activeAlerts = priceAlerts.filter((a) => a.active);
  const triggeredAlerts = priceAlerts.filter((a) => !a.active);

  return (
    <div className="flex flex-col gap-0 pb-4">
      {/* Form */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid #2A3F74' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: '#7D90BE' }}>New Alert</p>

        {/* Symbol select */}
        <div className="mb-2">
          <label className="text-[10px] font-semibold block mb-1" style={{ color: '#7D90BE' }}>Symbol</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full text-xs rounded-lg py-2 px-3 outline-none"
            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', color: '#E8EFFF' }}
          >
            {items.map((item) => (
              <option key={item.symbol} value={item.symbol} style={{ background: '#131d3d' }}>
                {item.symbol.replace('USDT', '')}/USDT
                {item.price ? ` — $${formatPrice(item.price)}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Condition toggle + price */}
        <div className="flex gap-2 mb-3">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            {(['above', 'below'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCondition(c)}
                className="px-3 py-1.5 text-[10px] font-bold capitalize transition-all"
                style={{
                  background: condition === c
                    ? c === 'above' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'
                    : 'transparent',
                  color: condition === c
                    ? c === 'above' ? '#22c55e' : '#ef4444'
                    : '#7D90BE',
                }}
              >
                {c === 'above' ? '▲' : '▼'} {c}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Target price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 text-xs rounded-lg py-1.5 px-3 outline-none"
            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', color: '#E8EFFF' }}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!price || !symbol}
          className="flex items-center gap-2 w-full justify-center py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
        >
          <Bell size={12} /> Set Alert
        </button>
      </div>

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <div className="px-4 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: '#7D90BE' }}>
            Active ({activeAlerts.length})
          </p>
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: '#131d3d', border: '1px solid #2A3F74' }}
              >
                <div className="flex items-center gap-2">
                  <Bell size={11} style={{ color: '#3B82F6' }} />
                  <span className="text-xs font-semibold" style={{ color: '#B3C2E8' }}>
                    {alert.symbol.replace('USDT', '')}
                  </span>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: alert.condition === 'above' ? '#22c55e' : '#ef4444' }}
                  >
                    {alert.condition === 'above' ? '▲' : '▼'} ${formatPrice(alert.targetPrice)}
                  </span>
                </div>
                <button
                  onClick={() => removePriceAlert(alert.id)}
                  className="p-1 rounded-lg transition-colors hover:bg-red-500/10"
                  style={{ color: '#7D90BE' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Triggered alerts */}
      {triggeredAlerts.length > 0 && (
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7D90BE' }}>
              Triggered ({triggeredAlerts.length})
            </p>
            <button
              onClick={clearTriggered}
              className="flex items-center gap-1 text-[10px] font-semibold"
              style={{ color: '#7D90BE' }}
            >
              <Trash2 size={10} /> Clear all
            </button>
          </div>
          <div className="space-y-2 opacity-50">
            {triggeredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: '#131d3d', border: '1px solid #2A3F74' }}
              >
                <div className="flex items-center gap-2">
                  <BellOff size={11} style={{ color: '#7D90BE' }} />
                  <span className="text-xs" style={{ color: '#7D90BE' }}>
                    {alert.symbol.replace('USDT', '')}
                  </span>
                  <span className="text-[10px]" style={{ color: '#7D90BE' }}>
                    {alert.condition === 'above' ? '▲' : '▼'} ${formatPrice(alert.targetPrice)}
                  </span>
                </div>
                <button onClick={() => removePriceAlert(alert.id)} className="p-1" style={{ color: '#7D90BE' }}>
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {priceAlerts.length === 0 && (
        <div className="px-4 pt-6 text-center">
          <Bell size={28} className="mx-auto mb-3" style={{ color: '#2A3F74' }} />
          <p className="text-sm font-semibold" style={{ color: '#7D90BE' }}>No price alerts</p>
          <p className="text-xs mt-1" style={{ color: '#7D90BE' }}>Set alerts to get notified when price crosses a level.</p>
        </div>
      )}
    </div>
  );
}


