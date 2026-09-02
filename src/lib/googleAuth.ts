/**
 * Google OAuth helper (server-side authorization-code + PKCE flow).
 *
 * The browser no longer loads Google Identity Services or handles an ID token.
 * Instead it simply redirects the whole page to the backend's /auth/google
 * endpoint, which performs the full server-side OAuth exchange (using the
 * client secret) and redirects back to /google/callback on success.
 *
 * Usage:
 *   import { signInWithGoogle } from '../lib/googleAuth';
 *   signInWithGoogle(); // navigates to Google — returns nothing
 */
import { API_BASE_URL } from './config';

const FROM_KEY = 'cinebook_google_from';

export function signInWithGoogle(fromPath?: string): void {
  if (fromPath && fromPath !== '/') {
    try {
      sessionStorage.setItem(FROM_KEY, fromPath);
    } catch {
      /* ignore */
    }
  } else {
    try {
      sessionStorage.removeItem(FROM_KEY);
    } catch {
      /* ignore */
    }
  }
  window.location.href = `${API_BASE_URL}/auth/google`;
}

/** Returns (and clears) the path the user intended before Google sign-in. */
export function takeGoogleReturnPath(): string | null {
  try {
    const path = sessionStorage.getItem(FROM_KEY);
    sessionStorage.removeItem(FROM_KEY);
    return path;
  } catch {
    return null;
  }
}
