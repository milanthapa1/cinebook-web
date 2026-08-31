import axios from 'axios';
import { API_BASE_URL } from './config.js';
import { useAuthStore } from '../features/auth/useAuthStore.js';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sending httpOnly refresh cookies
});

// Request interceptor to attach JWT Access Token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Single-flight token refresh ─────────────────────────────────────────────
// Multiple requests may fail with 401 at the same time (token expiry).
// We share one refresh call so concurrent requests don't each hit /auth/refresh.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const res = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  if (res.data?.success && res.data?.data?.accessToken) {
    return res.data.data.accessToken as string;
  }
  throw new Error('Refresh token invalid');
}

function refreshAndStoreToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .then((newToken) => {
        useAuthStore.getState().setAccessToken(newToken);
        return newToken;
      })
      .catch((err) => {
        // Refresh token also expired/revoked — force re-login once,
        // then re-throw so every waiting request rejects too.
        useAuthStore.getState().logout();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Response interceptor to handle auto 401 refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error (API server not reachable) - don't retry, just reject
    if (!error.response) {
      return Promise.reject(error);
    }

    // Skip token-refresh retry for auth endpoints (login, register, google).
    // A 401 on these endpoints means "invalid credentials", not "token expired",
    // so attempting a refresh would be pointless and could trigger logout().
    const isAuthEndpoint =
      originalRequest.url?.startsWith('/auth/') &&
      !originalRequest.url?.startsWith('/auth/refresh');
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAndStoreToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
