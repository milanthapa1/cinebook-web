import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../features/auth/useAuthStore';
import { takeGoogleReturnPath } from '../lib/googleAuth';

/**
 * Landing page reached after the server-side Google OAuth success redirect.
 *
 * The server passes a short-lived one-time ?token= in the URL instead of
 * relying on cross-origin httpOnly cookies (which modern browsers block during
 * cross-domain redirects from Render → Vercel).
 *
 * We POST that token to /auth/google/session which:
 *   1. Validates + deletes the one-time DB row (single-use)
 *   2. Sets the httpOnly refresh cookie (same-origin now, so it works)
 *   3. Returns the access token + user profile in JSON
 */
export const GoogleCallbackPage: React.FC = () => {
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(urlError);
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError('No session token received. Please try signing in again.');
      return;
    }

    (async () => {
      try {
        // Exchange the one-time token for real JWT tokens.
        // The API sets the httpOnly refresh cookie in this response and
        // returns the access token + user in the body.
        const res = await apiClient.get(`/auth/google/session?token=${encodeURIComponent(token)}`);

        const { user, accessToken } = res.data?.data ?? {};
        if (!accessToken || !user) throw new Error('Could not establish a session');

        setAuth(user, accessToken);
        navigate(takeGoogleReturnPath() || '/', { replace: true });
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          'Google login failed. Please try again.'
        );
      }
    })();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl text-center space-y-4 dark:bg-gray-900 dark:border-gray-800">
        {error ? (
          <>
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight dark:text-gray-100">
              Could not sign in with Google
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">{error}</p>
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
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight dark:text-gray-100">
              Signing you in...
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">Completing your Google sign-in</p>
          </>
        )}
      </div>
    </div>
  );
};
