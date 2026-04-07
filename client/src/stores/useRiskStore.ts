import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { RiskManagement } from '@/types';
import { RISK_DEFAULTS } from '@/constants';

interface RiskState {
  accountSize: number;
  riskPercent: number;
  risk: RiskManagement | null;
  setAccountSize: (size: number) => void;
  setRiskPercent: (pct: number) => void;
  setRisk: (risk: RiskManagement | null) => void;
}

export const useRiskStore = create<RiskState>()(
  subscribeWithSelector((set) => ({
    accountSize: RISK_DEFAULTS.accountSize,
    riskPercent: RISK_DEFAULTS.riskPercent,
    risk: null,

    setAccountSize: (accountSize) => set({ accountSize }),
    setRiskPercent: (riskPercent) => set({ riskPercent }),
    setRisk: (risk) => set({ risk }),
  }))
);
