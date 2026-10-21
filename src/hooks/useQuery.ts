import { useCallback, useRef, useState } from "react";
import { errorMessage } from "../api/client";
import type { ApiClient } from "../api/client";
import type { QueryResponse } from "../api/types";

export function useQuery(client: ApiClient) {
  const [data, setData] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const ask = useCallback(
    async (question: string) => {
      const id = ++latest.current;
      setLoading(true);
      setError(null);
      try {
        const result = await client.query(question);
        if (id === latest.current) setData(result);
      } catch (e) {
        if (id === latest.current) {
          setData(null);
          setError(errorMessage(e));
        }
      } finally {
        // Only the newest request controls the loading flag.
        if (id === latest.current) setLoading(false);
      }
    },
    [client],
  );

  return { data, loading, error, ask };
}
