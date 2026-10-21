import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api/client";
import type { ApiClient } from "../api/client";
import type { SourceInfo } from "../api/types";

export function useSources(client: ApiClient) {
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.listSources();
      setSources(result.sources);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [client]);

  const remove = useCallback(
    async (sourcePath: string) => {
      try {
        await client.deleteSource(sourcePath);
        await refresh();
      } catch (e) {
        setError(errorMessage(e));
      }
    },
    [client, refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { sources, loading, error, refresh, remove };
}
