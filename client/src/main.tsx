import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppRouter } from './router';
import { useAuthStore } from '@/stores/useAuthStore';

// Restore session before first render
useAuthStore.getState().initFromStorage().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppRouter />
    </StrictMode>
  );
});
