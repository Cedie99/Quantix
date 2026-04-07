import { useState, useMemo } from 'react';
import { useJournalStore } from '@/stores/useJournalStore';
import { useSignalStore } from '@/stores/useSignalStore';
import { useRiskStore } from '@/stores/useRiskStore';
import { useChartStore } from '@/stores/useChartStore';
import { formatPrice, formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Plus, X, TrendingUp, TrendingDown, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Trade } from '@/types';

export function JournalTab() {
  const { trades, addTrade, closeTrade, cancelTrade } = useJournalStore();
  const history = useSignalStore((s) => s.history);
  const risk = useRiskStore((s) => s.risk);
  const { symbol, candles } = useChartStore();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    side: 'long' as 'long' | 'short',
    entry: '',
    stop: '',
    tp1: '',
    qty: '',
    notes: '',
  });
  const [closePrices, setClosePrices] = useState<Record<string, string>>({});

  const lastClose = candles.length > 0 ? candles[candles.length - 1].close : null;

  // Pre-fill from risk store when opening form
  const handleOpenForm = () => {
    if (risk) {
      const isSell = false;
      setFormData({
        side: 'long',
        entry: risk.entryPrice.toFixed(2),
        stop: (risk.entryPrice - risk.stopDistance).toFixed(2),
        tp1: (risk.entryPrice + risk.stopDistance * 2).toFixed(2),
        qty: risk.positionSize.toFixed(4),
        notes: '',
      });
    }
    setShowForm(true);
  };

  const handleSubmit = () => {
    const entry = parseFloat(formData.entry);
    const stop = parseFloat(formData.stop);
    const tp1 = parseFloat(formData.tp1);
    const qty = parseFloat(formData.qty);
    if (!entry || !stop || !tp1 || !qty) return;

    addTrade({
      symbol,
      side: formData.side,
      entry,
      stop,
      tp1,
      qty,
      notes: formData.notes || undefined,
    });
    setShowForm(false);
  };

  // Stats from signal history
  const signalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of history) counts[s.type] = (counts[s.type] ?? 0) + 1;
    return counts;
  }, [history]);

  // Trade stats from closed trades
  const tradeStats = useMemo(() => {
    const closed = trades.filter((t) => t.status === 'closed' && t.pnl !== undefined);
    if (!closed.length) return null;
    const winners = closed.filter((t) => (t.pnl ?? 0) > 0);
    const losers = closed.filter((t) => (t.pnl ?? 0) <= 0);
    const winRate = (winners.length / closed.length) * 100;
    const avgProfit = winners.length ? winners.reduce((s, t) => s + (t.pnl ?? 0), 0) / winners.length : 0;
    const avgLoss = losers.length ? losers.reduce((s, t) => s + (t.pnl ?? 0), 0) / losers.length : 0;
    return { total: closed.length, winRate, avgProfit, avgLoss };
  }, [trades]);

  const openTrades = trades.filter((t) => t.status === 'open');
  const closedTrades = trades.filter((t) => t.status === 'closed' || t.status === 'cancelled');

  return (
    <div className="flex flex-col gap-0 pb-4">
      {/* Stats bar */}
      <div
        className="px-4 py-3 flex flex-wrap gap-3"
        style={{ borderBottom: '1px solid #2A3F74', background: '#131d3d' }}
      >
        {/* Signal counts */}
        <div className="flex gap-2 flex-wrap">
          {(['STRONG_BUY', 'BUY', 'NEUTRAL', 'SELL', 'STRONG_SELL'] as const).map((type) => {
            const count = signalCounts[type] ?? 0;
            if (!count) return null;
            const color = type.includes('BUY') ? '#22c55e' : type === 'NEUTRAL' ? '#eab308' : '#ef4444';
            return (
              <span key={type} className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                {type.replace('_', ' ')} ×{count}
              </span>
            );
          })}
        </div>

        {/* Trade stats */}
        {tradeStats && (
          <div className="flex gap-3 w-full text-[10px]">
            <span style={{ color: '#7D90BE' }}>Win rate: <span className="font-bold" style={{ color: '#22c55e' }}>{tradeStats.winRate.toFixed(0)}%</span></span>
            <span style={{ color: '#7D90BE' }}>Avg profit: <span className="font-bold" style={{ color: '#22c55e' }}>${formatNumber(tradeStats.avgProfit, 2)}</span></span>
            <span style={{ color: '#7D90BE' }}>Avg loss: <span className="font-bold" style={{ color: '#ef4444' }}>${formatNumber(tradeStats.avgLoss, 2)}</span></span>
          </div>
        )}
      </div>

      {/* Log trade toggle */}
      <div className="px-4 pt-4">
        <button
          onClick={showForm ? () => setShowForm(false) : handleOpenForm}
          className="flex items-center gap-2 w-full justify-center py-2 rounded-xl text-xs font-bold transition-all duration-200"
          style={{
            background: showForm ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.1)',
            border: showForm ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(59,130,246,0.2)',
            color: showForm ? '#ef4444' : '#3B82F6',
          }}
        >
          {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Log Trade</>}
        </button>

        {showForm && (
          <div className="mt-3 space-y-2.5 p-3 rounded-2xl" style={{ background: '#131d3d', border: '1px solid #2A3F74' }}>
            {/* Side toggle */}
            <div className="flex gap-2">
              {(['long', 'short'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFormData((f) => ({ ...f, side: s }))}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
                  style={{
                    background: formData.side === s
                      ? s === 'long' ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.15)'
                      : 'rgba(0,0,0,0.03)',
                    color: formData.side === s
                      ? s === 'long' ? '#166534' : '#b91c1c'
                      : '#7D90BE',
                    border: formData.side === s
                      ? s === 'long' ? '1px solid rgba(22,163,74,0.3)' : '1px solid rgba(239,68,68,0.3)'
                      : '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  {s === 'long' ? <TrendingUp size={11} className="inline mr-1" /> : <TrendingDown size={11} className="inline mr-1" />}
                  {s}
                </button>
              ))}
            </div>

            {/* Fields */}
            {[
              { label: 'Entry Price', key: 'entry' as const, prefix: '$' },
              { label: 'Stop Loss', key: 'stop' as const, prefix: '$' },
              { label: 'Take Profit 1', key: 'tp1' as const, prefix: '$' },
              { label: 'Quantity', key: 'qty' as const, prefix: '' },
            ].map(({ label, key, prefix }) => (
              <div key={key}>
                <label className="text-[10px] font-semibold block mb-1" style={{ color: '#7D90BE' }}>{label}</label>
                <div className="relative">
                  {prefix && (
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold select-none" style={{ color: '#7D90BE' }}>{prefix}</span>
                  )}
                  <input
                    type="number"
                    value={formData[key]}
                    onChange={(e) => setFormData((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full text-xs rounded-lg py-1.5 outline-none"
                    style={{
                      background: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      color: '#E8EFFF',
                      padding: prefix ? '6px 10px 6px 20px' : '6px 10px',
                    }}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
            >
              Add to Journal
            </button>
          </div>
        )}
      </div>

      {/* Open trades */}
      {openTrades.length > 0 && (
        <div className="px-4 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: '#7D90BE' }}>Open Trades</p>
          <div className="space-y-2">
            {openTrades.map((trade) => {
              const unrealizedPnl = lastClose
                ? trade.side === 'long'
                  ? (lastClose - trade.entry) * trade.qty
                  : (trade.entry - lastClose) * trade.qty
                : null;
              const closeInput = closePrices[trade.id] ?? '';
              return (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  unrealizedPnl={unrealizedPnl}
                  closeInput={closeInput}
                  onCloseInputChange={(v) => setClosePrices((p) => ({ ...p, [trade.id]: v }))}
                  onClose={() => {
                    const price = parseFloat(closeInput) || lastClose;
                    if (price) closeTrade(trade.id, price);
                  }}
                  onCancel={() => cancelTrade(trade.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Trade history */}
      {closedTrades.length > 0 && (
        <div className="px-4 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: '#7D90BE' }}>History</p>
          <div className="space-y-2">
            {closedTrades.slice(0, 20).map((trade) => (
              <HistoryCard key={trade.id} trade={trade} />
            ))}
          </div>
        </div>
      )}

      {trades.length === 0 && (
        <div className="px-4 pt-6 text-center">
          <BarChart2 size={28} className="mx-auto mb-3" style={{ color: '#2A3F74' }} />
          <p className="text-sm font-semibold" style={{ color: '#7D90BE' }}>No trades yet</p>
          <p className="text-xs mt-1" style={{ color: '#7D90BE' }}>Log paper trades to track your P&L and signal performance.</p>
        </div>
      )}
    </div>
  );
}

function TradeCard({ trade, unrealizedPnl, closeInput, onCloseInputChange, onClose, onCancel }: {
  trade: Trade;
  unrealizedPnl: number | null;
  closeInput: string;
  onCloseInputChange: (v: string) => void;
  onClose: () => void;
  onCancel: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const pnlColor = unrealizedPnl === null ? '#B3C2E8' : unrealizedPnl >= 0 ? '#166534' : '#b91c1c';

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2A3F74', background: '#131d3d' }}>
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold" style={{ color: trade.side === 'long' ? '#166534' : '#b91c1c' }}>
            {trade.side.toUpperCase()}
          </span>
          <span className="text-xs font-semibold" style={{ color: '#B3C2E8' }}>{trade.symbol.replace('USDT', '')}</span>
          <span className="text-[10px] font-mono" style={{ color: '#7D90BE' }}>{formatNumber(trade.qty, 4)}</span>
        </div>
        <div className="flex items-center gap-2">
          {unrealizedPnl !== null && (
            <span className="text-xs font-bold font-mono" style={{ color: pnlColor }}>
              {unrealizedPnl >= 0 ? '+' : ''}${formatNumber(unrealizedPnl, 2)}
            </span>
          )}
          {expanded ? <ChevronUp size={12} style={{ color: '#7D90BE' }} /> : <ChevronDown size={12} style={{ color: '#7D90BE' }} />}
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2" style={{ borderTop: '1px solid #2A3F74' }}>
          <div className="flex gap-3 text-[10px] pt-2">
            <span style={{ color: '#7D90BE' }}>Entry <span className="font-mono font-bold" style={{ color: '#B3C2E8' }}>${formatPrice(trade.entry)}</span></span>
            <span style={{ color: '#7D90BE' }}>Stop <span className="font-mono font-bold text-red-400">${formatPrice(trade.stop)}</span></span>
            <span style={{ color: '#7D90BE' }}>TP1 <span className="font-mono font-bold text-green-400">${formatPrice(trade.tp1)}</span></span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Close price"
              value={closeInput}
              onChange={(e) => onCloseInputChange(e.target.value)}
              className="flex-1 text-xs rounded-lg py-1.5 px-2.5 outline-none"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', color: '#E8EFFF' }}
            />
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white"
              style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.3)', color: '#166534' }}
            >
              Close
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryCard({ trade }: { trade: Trade }) {
  const pnl = trade.pnl ?? 0;
  const pnlColor = pnl > 0 ? '#22c55e' : pnl < 0 ? '#ef4444' : '#B3C2E8';

  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-xl"
      style={{ background: '#131d3d', border: '1px solid #2A3F74' }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
          style={{
            background: trade.status === 'cancelled' ? 'rgba(0,0,0,0.04)' : trade.side === 'long' ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)',
            color: trade.status === 'cancelled' ? '#7D90BE' : trade.side === 'long' ? '#166534' : '#b91c1c',
          }}
        >
          {trade.status === 'cancelled' ? 'CANCELLED' : trade.side.toUpperCase()}
        </span>
        <span className="text-xs" style={{ color: '#7D90BE' }}>{trade.symbol.replace('USDT', '')}</span>
        <span className="text-[10px] font-mono" style={{ color: '#7D90BE' }}>${formatPrice(trade.entry)}</span>
      </div>
      {trade.status === 'closed' && (
        <span className="text-xs font-bold font-mono" style={{ color: pnlColor }}>
          {pnl >= 0 ? '+' : ''}${formatNumber(pnl, 2)}
        </span>
      )}
    </div>
  );
}


