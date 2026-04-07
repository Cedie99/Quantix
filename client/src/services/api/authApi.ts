import { httpClient } from './httpClient';

interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

interface UserDataResponse {
  watchlist: string[];
  riskSettings: { account_size: number; risk_percent: number } | null;
  chartPrefs: { symbol: string; timeframe: string } | null;
  alertHistory: unknown[];
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const res = await httpClient.post<AuthResponse>('/auth/register', { email, password });
  return res.data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await httpClient.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
}

export async function fetchUserData(): Promise<UserDataResponse> {
  const res = await httpClient.get<UserDataResponse>('/user/data');
  return res.data;
}

export async function syncWatchlist(symbols: string[]): Promise<void> {
  await httpClient.put('/user/watchlist', { symbols });
}

export async function syncRisk(accountSize: number, riskPercent: number): Promise<void> {
  await httpClient.put('/user/risk', { accountSize, riskPercent });
}

export async function syncChartPrefs(symbol: string, timeframe: string): Promise<void> {
  await httpClient.put('/user/chart-prefs', { symbol, timeframe });
}

export async function saveAlert(alert: {
  symbol: string;
  signal: string;
  price: number;
  triggeredAt: number;
}): Promise<void> {
  await httpClient.post('/user/alerts', alert);
}

export async function markAlertsRead(): Promise<void> {
  await httpClient.put('/user/alerts/read-all');
}
