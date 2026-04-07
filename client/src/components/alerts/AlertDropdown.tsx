import { useEffect, useRef } from 'react';
import { useAlertStore } from '@/stores/useAlertStore';
import { SignalBadge } from '@/components/signals/SignalBadge';
import { formatPrice, formatDateTime } from '@/utils/format';
import { X, Bell } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function AlertDropdown({ onClose }: Props) {
  const { alerts, markAllRead, clearAlerts } = useAlertStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl z-50"
      style={{
        background: '#0f1630',
        border: '1px solid #2A3F74',
        boxShadow: '0 16px 42px rgba(2,5,15,0.55)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #2A3F74' }}
      >
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#E8EFFF' }}>Signal Alerts</h3>
          <p className="text-[12px]" style={{ color: '#7D90BE' }}>Strong buy/sell signals detected</p>
        </div>
        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <button
              onClick={clearAlerts}
              className="text-xs px-2 py-1 rounded transition-all duration-150"
              style={{ color: '#7D90BE' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#7D90BE';
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded transition-all duration-150"
            style={{ color: '#7D90BE' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#B3C2E8';
              (e.currentTarget as HTMLButtonElement).style.background = '#131d3d';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#7D90BE';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell size={24} className="mx-auto mb-2" style={{ color: '#2A3F74' }} />
            <p className="text-sm" style={{ color: '#7D90BE' }}>No alerts yet</p>
            <p className="text-xs mt-1" style={{ color: '#7D90BE' }}>
              You'll be notified when a strong signal appears
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="px-4 py-3 last:border-0 transition-colors"
              style={{ borderBottom: '1px solid #131d3d' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = '#131d3d';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm" style={{ color: '#E8EFFF' }}>
                  {alert.symbol.replace('USDT', '')}
                  <span className="font-normal text-xs" style={{ color: '#7D90BE' }}>/USDT</span>
                </span>
                <SignalBadge type={alert.signal} size="sm" />
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-mono" style={{ color: '#B3C2E8' }}>${formatPrice(alert.price)}</span>
                <span style={{ color: '#7D90BE' }}>{formatDateTime(alert.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


