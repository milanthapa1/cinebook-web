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

// Response interceptor to handle auto 401 refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error (API server not reachable) — don't retry, just reject
    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (res.data?.success && res.data?.data?.accessToken) {
          const newToken = res.data.data.accessToken;
          useAuthStore.getState().setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
