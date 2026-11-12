// The public demo account. Showing it on the login page is intended.
export const DEMO_ACCOUNT = {
  email: "operator@stratum.io",
  password: "Stratum@Op1!",
};

// The server's health check sits next to the API, outside /api
export const HEALTH_URL = `${(import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "")}/health`;
