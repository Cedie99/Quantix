import { useRiskStore } from '@/stores/useRiskStore';
import { useChartStore } from '@/stores/useChartStore';
import { formatPrice, formatNumber } from '@/utils/format';

const INPUT_BASE: React.CSSProperties = {
  background: 'rgba(0,0,0,0.04)',
  border: '1px solid rgba(0,0,0,0.06)',
  color: '#0F172A',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  outline: 'none',
  borderRadius: 10,
  width: '100%',
  fontSize: 14,
};

function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
  e.currentTarget.style.boxShadow = 'none';
}

export function RiskPanel() {
  const { risk, accountSize, riskPercent, setAccountSize, setRiskPercent } = useRiskStore();
  const { candles } = useChartStore();
  const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 0;
  const riskAmount = accountSize > 0 ? (accountSize * riskPercent) / 100 : null;

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#64748B' }}>
        Position Sizing
      </h3>

      {/* Inputs */}
      <div className="space-y-3">
        {/* Account size */}
        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: '#334155' }}>
            Trading Budget
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold select-none"
              style={{ color: '#64748B' }}
            >
              $
            </span>
            <input
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(parseFloat(e.target.value) || 0)}
              style={{ ...INPUT_BASE, padding: '9px 12px 9px 24px' }}
              placeholder="10000"
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {/* Risk % */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold" style={{ color: '#334155' }}>Risk Per Trade</label>
            {riskAmount !== null && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}
              >
                ${formatNumber(riskAmount, 2)} at risk
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              value={riskPercent}
              step="0.1"
              min="0.1"
              max="10"
              onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 1)}
              style={{ ...INPUT_BASE, padding: '9px 28px 9px 12px' }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold select-none"
              style={{ color: '#64748B' }}
            >
              %
            </span>
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: '#64748B' }}>
            Recommended 1–2% per trade
          </p>
        </div>
      </div>

      {/* Results */}
      {risk && lastClose > 0 ? (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(0,0,0,0.05)' }}
        >
          <div
            className="px-3.5 py-2.5"
            style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#64748B' }}>
              Calculated Sizing
            </p>
          </div>
          <div className="p-3.5 space-y-2.5" style={{ background: 'rgba(0,0,0,0.02)' }}>
            <RiskRow
              label="Max Loss"
              value={`$${formatNumber(risk.riskAmountUSD, 2)}`}
              color="text-amber-400"
              hint="Lost if stop-loss hits"
            />
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }} className="pt-2.5 space-y-2.5">
              <RiskRow
                label="Position Size"
                value={`${formatNumber(risk.positionSize, 4)}`}
                color="text-neutral-300"
              />
              <RiskRow
                label="Position Value"
                value={`$${formatNumber(risk.positionSizeUSD, 2)}`}
                color="text-neutral-300"
              />
            </div>
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }} className="pt-2.5">
              <RiskRow
                label="Stop Distance"
                value={`$${formatPrice(risk.stopDistance)}`}
                color="text-neutral-400"
                hint="ATR-based buffer"
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl px-4 py-6 text-center"
          style={{ background: 'rgba(0,0,0,0.02)', border: '1px dashed rgba(0,0,0,0.06)' }}
        >
          <p className="text-xs" style={{ color: '#64748B' }}>
            {lastClose > 0 ? 'Calculating...' : 'Waiting for price data'}
          </p>
        </div>
      )}
    </div>
  );
}

function RiskRow({
  label, value, color, hint,
}: {
  label: string;
  value: string;
  color: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center text-xs">
        <span style={{ color: '#334155' }}>{label}</span>
        <span className={`font-mono font-bold tabular-nums ${color}`}>{value}</span>
      </div>
      {hint && (
        <p className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>{hint}</p>
      )}
    </div>
  );
}
