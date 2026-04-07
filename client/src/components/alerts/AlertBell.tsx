import { useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useAlertStore } from '@/stores/useAlertStore';
import { AlertDropdown } from './AlertDropdown';

export function AlertBell() {
  const unreadCount = useAlertStore((s) => s.unreadCount);
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => setOpen(false), []);

  function handleOpen() {
    setOpen((v) => !v);
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-md transition-all duration-150"
        style={{ color: '#B3C2E8' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = '#E8EFFF';
          (e.currentTarget as HTMLButtonElement).style.background = '#1c2a56';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = '#B3C2E8';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[12px] rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && <AlertDropdown onClose={handleClose} />}
    </div>
  );
}


