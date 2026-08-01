import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/index.css';
import { useAuthStore } from './features/auth/useAuthStore';
import { API_BASE_URL } from './lib/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

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
    .then(r => r.json())
    .then(data => {
      if (data?.success && data?.data?.accessToken) {
        setAccessToken(data.data.accessToken);
      } else {
        logout(); // refresh token also expired — force re-login
      }
    })
    .catch(() => logout());
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
