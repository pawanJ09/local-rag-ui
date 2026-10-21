import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "./client";
import { fakeResponse } from "../test/helpers";

describe("api client", () => {
  it("sends the API key and a JSON body to /query", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      fakeResponse({ answer: "42", sources: [], grounded: true }),
    );
    const client = createApiClient({ baseUrl: "http://localhost:8000/", apiKey: "k1", fetchFn });

    const result = await client.query("hello");

    expect(result.grounded).toBe(true);
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("http://localhost:8000/query"); // trailing slash trimmed
    expect(init.method).toBe("POST");
    expect(init.headers["X-API-Key"]).toBe("k1");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ question: "hello" });
  });

  it("turns a 401 into an ApiError with a helpful message", async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ detail: "Invalid" }, 401));
    const client = createApiClient({ baseUrl: "http://x", apiKey: "bad", fetchFn });

    const error = await client.listSources().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).message).toMatch(/API key/);
  });

  it("explains when the backend cannot be reached", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const client = createApiClient({ baseUrl: "http://x", apiKey: "k", fetchFn });

    await expect(client.health()).rejects.toThrow(/Cannot reach the backend/);
  });

  it("keeps slashes but encodes other characters when deleting a source", async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ deleted: "x" }));
    const client = createApiClient({ baseUrl: "http://x", apiKey: "k", fetchFn });

    await client.deleteSource("My Docs/a b.pdf");

    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("http://x/sources/My%20Docs/a%20b.pdf");
    expect(init.method).toBe("DELETE");
  });
});
