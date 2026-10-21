import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { clientWith, fakeResponse, routedFetch } from "../test/helpers";
import { useSources } from "./useSources";

const source = (path: string) => ({
  source_path: path,
  chunk_count: 3,
  file_hash: "h",
  last_indexed: "2026-01-01T00:00:00+00:00",
});

describe("useSources", () => {
  it("loads the indexed documents on mount", async () => {
    const { fetchFn } = routedFetch({
      "GET /sources": () => fakeResponse({ sources: [source("a.pdf")] }),
    });
    const client = clientWith(fetchFn);

    const { result } = renderHook(() => useSources(client));

    await waitFor(() => expect(result.current.sources).toHaveLength(1));
    expect(result.current.sources[0].source_path).toBe("a.pdf");
  });

  it("removes a document and then reloads the list", async () => {
    let list = [source("a.pdf"), source("b.pdf")];
    const { fetchFn, calls } = routedFetch({
      "GET /sources": () => fakeResponse({ sources: list }),
      "DELETE /sources/a.pdf": () => {
        list = [source("b.pdf")];
        return fakeResponse({ deleted: "a.pdf" });
      },
    });
    const client = clientWith(fetchFn);
    const { result } = renderHook(() => useSources(client));
    await waitFor(() => expect(result.current.sources).toHaveLength(2));

    await act(async () => {
      await result.current.remove("a.pdf");
    });

    expect(calls).toContain("DELETE /sources/a.pdf");
    expect(result.current.sources.map((s) => s.source_path)).toEqual(["b.pdf"]);
  });

  it("shows an error when the list cannot be loaded", async () => {
    const { fetchFn } = routedFetch({
      "GET /sources": () => fakeResponse({ detail: "bad" }, 401),
    });
    const client = clientWith(fetchFn);

    const { result } = renderHook(() => useSources(client));

    await waitFor(() => expect(result.current.error).toMatch(/API key/));
  });
});
