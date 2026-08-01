import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'cinebook-auth',
      // Only persist the user object — not the accessToken.
      // The access token is short-lived (15 min) and is re-issued via
      // the httpOnly refresh token cookie on page reload. Persisting it
      // in localStorage is a security risk (XSS exposure).
      partialize: (state) => ({ user: state.user }),
    }
  )
);
