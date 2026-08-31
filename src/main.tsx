import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/index.css';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './features/auth/useAuthStore';
import { API_BASE_URL } from './lib/config';

// On every app load: if we have a persisted user but no accessToken,
// silently hit /auth/refresh (uses the httpOnly cookie) to get a new token.
// This prevents 401 errors after a page refresh when the 15-min token expired.
const { user, accessToken, setAccessToken, logout } = useAuthStore.getState();
if (user && !accessToken) {
  fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(async (r) => {
      const data = await r.json();

      // Only destroy the session when the API explicitly rejects the refresh
      // token (expired/revoked). A failed/transient request must not log the
      // user out on a plain page refresh.
      if (r.status === 401 && data?.success === false) {
        logout();
        return;
      }

      if (data?.success && data?.data?.accessToken) {
        setAccessToken(data.data.accessToken);
      }
    })
    .catch(() => {
      // Network error - leave the persisted session intact.
    });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
