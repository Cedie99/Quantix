import axios from 'axios';
import { API_BASE } from '@/constants';

export const httpClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token from localStorage
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Dynamically import to avoid circular deps at module load time
      import('@/stores/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
      });
    }
    const message = error.response?.data?.error || error.message || 'Network error';
    console.error('[API Error]', message);
    return Promise.reject(new Error(message));
  }
);
