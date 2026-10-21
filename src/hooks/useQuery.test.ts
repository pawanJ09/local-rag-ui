import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { clientWith, fakeResponse } from "../test/helpers";
import { useQuery } from "./useQuery";

describe("useQuery", () => {
  it("returns the answer and stops loading", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      fakeResponse({ answer: "42", sources: [], grounded: true }),
    );
    const client = clientWith(fetchFn);
    const { result } = renderHook(() => useQuery(client));

    await act(async () => {
      await result.current.ask("hi");
    });

    expect(result.current.data?.answer).toBe("42");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("exposes an error message when the request fails", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const client = clientWith(fetchFn);
    const { result } = renderHook(() => useQuery(client));

    await act(async () => {
      await result.current.ask("hi");
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toMatch(/Cannot reach the backend/);
  });

  it("ignores a slow earlier request that finishes after a newer one", async () => {
    let resolveFirst!: (r: Response) => void;
    const first = new Promise<Response>((r) => {
      resolveFirst = r;
    });
    const fetchFn = vi
      .fn()
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce(fakeResponse({ answer: "second", sources: [], grounded: true }));
    const client = clientWith(fetchFn);
    const { result } = renderHook(() => useQuery(client));

    let firstCall!: Promise<void>;
    act(() => {
      firstCall = result.current.ask("one");
    });
    await act(async () => {
      await result.current.ask("two");
    });
    await act(async () => {
      resolveFirst(fakeResponse({ answer: "first", sources: [], grounded: true }));
      await firstCall;
    });

    expect(result.current.data?.answer).toBe("second");
  });
});
