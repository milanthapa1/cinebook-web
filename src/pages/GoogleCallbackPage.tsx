import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../features/auth/useAuthStore';

/**
 * Landing page reached after the server-side Google OAuth success redirect.
 * The server already set the httpOnly refresh cookie; here we fetch a fresh
 * access token and the user profile, then restore the session and continue.
 */
export const GoogleCallbackPage: React.FC = () => {
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(urlError);
      return;
    }

    (async () => {
      try {
        // Exchange the refresh cookie (set by the server callback) for an
        // access token, then fetch the user profile.
        const refreshRes = await apiClient.post('/auth/refresh');
        const accessToken = refreshRes.data?.data?.accessToken;
        if (!accessToken) throw new Error('Could not establish a session');

        // Set the token first so the subsequent /users/me request carries the
        // Authorization header (avoiding a needless 401 → auto-refresh round trip).
        setAccessToken(accessToken);

        const meRes = await apiClient.get('/users/me');
        const user = meRes.data?.data;
        if (!user) throw new Error('Could not load your profile');

        setAuth(user, accessToken);
        navigate('/', { replace: true });
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          'Google login failed. Please try again.'
        );
      }
    })();
  }, [searchParams, navigate, setAuth, setAccessToken]);

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl text-center space-y-4">
        {error ? (
          <>
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Could not sign in with Google
            </h1>
            <p className="text-xs text-gray-600">{error}</p>
            <Link
              to="/login"
              className="inline-block mt-2 w-full py-3 rounded-xl bg-[#00a8cc] hover:bg-[#0096c7] text-white font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Back to Sign In
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 text-[#00a8cc] animate-spin mx-auto" />
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Signing you in...
            </h1>
            <p className="text-xs text-gray-600">Completing your Google sign-in</p>
          </>
        )}
      </div>
    </div>
  );
};
