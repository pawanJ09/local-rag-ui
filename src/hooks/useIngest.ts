import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "../api/client";
import type { ApiClient } from "../api/client";
import type { IngestStatusResponse } from "../api/types";

export function useIngest(client: ApiClient, pollIntervalMs = 1500) {
  const [status, setStatus] = useState<IngestStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimer();
    };
  }, []);

  const poll = useCallback(
    async (jobId: string) => {
      try {
        const s = await client.getIngestStatus(jobId);
        if (!mounted.current) return;
        setStatus(s);
        if (s.status === "queued" || s.status === "running") {
          timer.current = setTimeout(() => void poll(jobId), pollIntervalMs);
        }
      } catch (e) {
        if (mounted.current) setError(errorMessage(e));
      }
    },
    [client, pollIntervalMs],
  );

  const start = useCallback(async () => {
    clearTimer();
    setError(null);
    setStarting(true);
    try {
      const { job_id } = await client.startIngest();
      if (mounted.current) await poll(job_id);
    } catch (e) {
      if (mounted.current) setError(errorMessage(e));
    } finally {
      if (mounted.current) setStarting(false);
    }
  }, [client, poll]);

  const isRunning = starting || status?.status === "queued" || status?.status === "running";

  return { status, error, isRunning, start };
}
