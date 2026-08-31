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

export function signInWithGoogle(): void {
  window.location.href = `${API_BASE_URL}/auth/google`;
}
