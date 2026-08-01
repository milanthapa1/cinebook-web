/**
 * Google Identity Services helper
 *
 * Loads the GSI script lazily (only once) and exposes a promise-based
 * `signInWithGoogle()` that resolves with the credential (ID token) string.
 *
 * Usage:
 *   import { signInWithGoogle } from '../lib/googleAuth';
 *   const idToken = await signInWithGoogle();
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

let scriptLoadPromise: Promise<void> | null = null;

/** Load the Google Identity Services script exactly once. */
function loadGsiScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    // Already loaded (e.g. hot-reload)
    if (typeof (window as any).google?.accounts?.id !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Open a Google One-Tap / popup flow and return the credential (ID token).
 * Throws if the user cancels or if Client ID is not configured.
 */
export async function signInWithGoogle(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.');
  }

  await loadGsiScript();

  return new Promise((resolve, reject) => {
    const google = (window as any).google;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string; error?: string }) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error(response.error ?? 'Google sign-in was cancelled'));
        }
      },
      cancel_on_tap_outside: true,
    });

    // Use the popup flow — works on localhost without any redirect setup
    google.accounts.id.prompt((notification: any) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        // One-Tap was suppressed (e.g. browser blocks it) — fall back to the
        // button-based popup flow which always works.
        const container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);

        google.accounts.id.renderButton(container, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          size: 'large',
        });

        // Trigger the rendered button
        const btn = container.querySelector('div[role="button"]') as HTMLElement | null;
        if (btn) {
          btn.click();
        } else {
          document.body.removeChild(container);
          reject(new Error('Google sign-in popup could not be opened. Please try again.'));
        }
      }
    });
  });
}
