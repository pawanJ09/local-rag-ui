import { vi } from "vitest";
import { createApiClient } from "../api/client";

/** A minimal stand-in for a fetch Response. */
export function fakeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

/** Build an ApiClient whose HTTP goes to the given fake fetch. */
export function clientWith(fetchFn: unknown) {
  return createApiClient({
    baseUrl: "http://backend.test",
    apiKey: "test-key",
    fetchFn: fetchFn as typeof fetch,
  });
}

/** Fake fetch that answers by "METHOD /path" and records every call. */
export function routedFetch(handlers: Record<string, () => Response>) {
  const calls: string[] = [];
  const fn = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${new URL(String(url)).pathname}`;
    calls.push(key);
    const handler = handlers[key];
    if (!handler) throw new Error(`Unexpected request: ${key}`);
    return handler();
  });
  return { fetchFn: fn, calls };
}
