import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientWith, fakeResponse } from "../test/helpers";
import { useIngest } from "./useIngest";

const statusBody = (status: string) => ({
  job_id: "j1",
  status,
  files_scanned: 3,
  files_indexed: 2,
  files_skipped: 1,
  files_unchanged: 0,
  skipped_files: [],
  error: null,
});

describe("useIngest", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a job, polls until it completes, then stops", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(fakeResponse({ job_id: "j1", status: "queued" }))
      .mockResolvedValueOnce(fakeResponse(statusBody("running")))
      .mockResolvedValueOnce(fakeResponse(statusBody("completed")));
    const client = clientWith(fetchFn);
    const { result } = renderHook(() => useIngest(client, 1000));

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.status?.status).toBe("running");
    expect(result.current.isRunning).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current.status?.status).toBe("completed");
    expect(result.current.isRunning).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(fetchFn).toHaveBeenCalledTimes(3); // no polling after completion
  });

  it("reports an error if the job cannot be started", async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ detail: "no" }, 401));
    const client = clientWith(fetchFn);
    const { result } = renderHook(() => useIngest(client, 1000));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toMatch(/API key/);
    expect(result.current.isRunning).toBe(false);
  });

  it("stops polling when the component unmounts", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(fakeResponse({ job_id: "j1", status: "queued" }))
      .mockResolvedValue(fakeResponse(statusBody("running")));
    const client = clientWith(fetchFn);
    const { result, unmount } = renderHook(() => useIngest(client, 1000));

    await act(async () => {
      await result.current.start();
    });
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(fetchFn).toHaveBeenCalledTimes(2); // start + first status only
  });
});
