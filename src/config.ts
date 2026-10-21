// Reads the runtime settings. Lives OUTSIDE api/ and hooks/ because it touches
// the browser (window), which those folders must stay free of.
//
// Both in dev and in Docker the values arrive through /config.js:
//   - Docker: written when the container starts from API_BASE_URL / API_KEY
//   - make dev: served by vite.config.ts from API_BASE_URL / API_KEY in .env
export interface AppConfig {
  baseUrl: string;
  apiKey: string;
}

declare global {
  interface Window {
    __RAG_CONFIG__?: { apiBaseUrl?: string; apiKey?: string };
  }
}

export function getConfig(): AppConfig {
  const runtime = window.__RAG_CONFIG__ ?? {};
  return {
    baseUrl: runtime.apiBaseUrl || "http://localhost:8000",
    apiKey: runtime.apiKey || "",
  };
}
