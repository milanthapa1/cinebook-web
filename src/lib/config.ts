// In development, Vite proxies /api → http://localhost:5000 so there are no
// cross-origin requests and no CORS/firewall issues.
// In production set VITE_API_BASE_URL to your deployed API URL.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api/v1';
