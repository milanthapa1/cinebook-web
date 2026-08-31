// In development, Vite proxies /api → http://localhost:5000 so there are no
// cross-origin requests and no CORS/firewall issues.
//
// VITE_API_BASE_URL may point at the API origin alone OR the fully qualified
// API base (origin + /api/v1). Normalize it so every request path lands under
// /api/v1 regardless of which form is provided.
const raw = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export const API_BASE_URL = raw
  ? raw.endsWith('/api/v1')
    ? raw
    : `${raw}/api/v1`
  : '/api/v1';
