import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

// In dev, serve /config.js from the same two settings the Docker image uses
// (API_BASE_URL, API_KEY in .env). They are NOT exposed to the app as
// VITE_ variables, so nothing secret is compiled into the JavaScript bundle.
function devRuntimeConfig(env: Record<string, string>): Plugin {
  return {
    name: "dev-runtime-config",
    configureServer(server) {
      server.middlewares.use("/config.js", (_req, res) => {
        const config = {
          apiBaseUrl: env.API_BASE_URL || "http://localhost:8000",
          apiKey: env.API_KEY || "",
        };
        res.setHeader("Content-Type", "application/javascript");
        res.setHeader("Cache-Control", "no-store");
        res.end(`window.__RAG_CONFIG__ = ${JSON.stringify(config)};`);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react(), devRuntimeConfig(env)],
    server: { port: 5173 },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: false,
    },
  };
});
