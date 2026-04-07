import { create } from 'zustand';
import { fetchUserData, loginUser, registerUser } from '@/services/api/authApi';
import { useWatchlistStore } from './useWatchlistStore';
import { useRiskStore } from './useRiskStore';
import { useChartStore } from './useChartStore';
import { useAlertStore } from './useAlertStore';
import type { Alert, AlertTrigger, Timeframe } from '@/types';
import { DEFAULT_WATCHLIST, RISK_DEFAULTS } from '@/constants';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initFromStorage: () => Promise<void>;
  loadUserData: () => Promise<void>;
}

function resetStores() {
  useWatchlistStore.getState().setItems(DEFAULT_WATCHLIST);
  useRiskStore.setState({ accountSize: RISK_DEFAULTS.accountSize, riskPercent: RISK_DEFAULTS.riskPercent });
  useChartStore.setState({ symbol: 'BTCUSDT', timeframe: '1m' });
  useAlertStore.getState().clearAlerts();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { token, user } = await loginUser(email, password);
      localStorage.setItem('auth_token', token);
      set({ token, user, isAuthenticated: true });
      await get().loadUserData();
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password) => {
    set({ isLoading: true });
    try {
      const { token, user } = await registerUser(email, password);
      localStorage.setItem('auth_token', token);
      set({ token, user, isAuthenticated: true });
      await get().loadUserData();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
    resetStores();
  },

  loadUserData: async () => {
    try {
      const data = await fetchUserData();

      if (data.watchlist?.length > 0) {
        useWatchlistStore.getState().setItems(data.watchlist);
      }
      if (data.riskSettings) {
        useRiskStore.setState({
          accountSize: Number(data.riskSettings.account_size),
          riskPercent: Number(data.riskSettings.risk_percent),
        });
      }
      if (data.chartPrefs) {
        useChartStore.setState({
          symbol: data.chartPrefs.symbol,
          timeframe: data.chartPrefs.timeframe as Timeframe,
        });
      }
      if (data.alertHistory?.length > 0) {
        const alerts: Alert[] = (data.alertHistory as Array<{
          id: string; symbol: string; signal: string; price: number;
          triggered_at: string; read: boolean;
        }>).map((a) => ({
          id: a.id,
          symbol: a.symbol,
          signal: a.signal as AlertTrigger,
          price: Number(a.price),
          timestamp: new Date(a.triggered_at).getTime(),
          read: a.read,
        }));
        useAlertStore.getState().setAlerts(alerts);
      }
    } catch (err) {
      console.error('[Auth] loadUserData failed', err);
    }
  },

  initFromStorage: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    set({ token, isLoading: true });
    try {
      const data = await fetchUserData();

      // Parse user id from JWT payload (we only need email from server data)
      const payload = JSON.parse(atob(token.split('.')[1]));
      set({ user: { id: payload.sub, email: '' }, isAuthenticated: true });

      // Re-fetch to get email — use the data we already have
      if (data.watchlist?.length > 0) {
        useWatchlistStore.getState().setItems(data.watchlist);
      }
      if (data.riskSettings) {
        useRiskStore.setState({
          accountSize: Number(data.riskSettings.account_size),
          riskPercent: Number(data.riskSettings.risk_percent),
        });
      }
      if (data.chartPrefs) {
        useChartStore.setState({
          symbol: data.chartPrefs.symbol,
          timeframe: data.chartPrefs.timeframe as Timeframe,
        });
      }
      if (data.alertHistory?.length > 0) {
        const alerts: Alert[] = (data.alertHistory as Array<{
          id: string; symbol: string; signal: string; price: number;
          triggered_at: string; read: boolean;
        }>).map((a) => ({
          id: a.id,
          symbol: a.symbol,
          signal: a.signal as AlertTrigger,
          price: Number(a.price),
          timestamp: new Date(a.triggered_at).getTime(),
          read: a.read,
        }));
        useAlertStore.getState().setAlerts(alerts);
      }
    } catch {
      localStorage.removeItem('auth_token');
      set({ token: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
