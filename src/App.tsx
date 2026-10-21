import { useMemo } from "react";
import { createApiClient } from "./api/client";
import { getConfig } from "./config";
import { Home } from "./pages/Home";

export default function App() {
  const config = useMemo(() => getConfig(), []);
  const client = useMemo(
    () => createApiClient({ baseUrl: config.baseUrl, apiKey: config.apiKey }),
    [config],
  );

  return (
    <>
      {!config.apiKey && (
        <div className="panel panel--error" role="alert">
          No API key is configured, so requests to the backend will be rejected. Set API_KEY in
          .env (dev) or pass -e API_KEY=... to the container.
        </div>
      )}
      <Home client={client} />
    </>
  );
}
