import { useEffect } from "react";
import type { ApiClient } from "../api/client";
import { AnswerPanel } from "../components/AnswerPanel";
import { IngestButton } from "../components/IngestButton";
import { QueryBox } from "../components/QueryBox";
import { SourcesList } from "../components/SourcesList";
import { useIngest } from "../hooks/useIngest";
import { useQuery } from "../hooks/useQuery";
import { useSources } from "../hooks/useSources";

interface Props {
  client: ApiClient;
}

export function Home({ client }: Props) {
  const query = useQuery(client);
  const ingest = useIngest(client);
  const sources = useSources(client);

  // After a scan finishes, refresh the list of indexed documents.
  const ingestStatus = ingest.status?.status;
  const { refresh } = sources;
  useEffect(() => {
    if (ingestStatus === "completed") void refresh();
  }, [ingestStatus, refresh]);

  return (
    <main className="page">
      <header>
        <h1>Local RAG</h1>
        <p className="muted">Ask questions about your own documents. Everything runs on this machine.</p>
      </header>

      <section aria-labelledby="ask-heading">
        <h2 id="ask-heading">Ask</h2>
        <QueryBox onSubmit={(q) => void query.ask(q)} disabled={query.loading} />
        <AnswerPanel result={query.data} loading={query.loading} error={query.error} />
      </section>

      <section aria-labelledby="docs-heading">
        <h2 id="docs-heading">Documents</h2>
        <IngestButton
          status={ingest.status}
          isRunning={ingest.isRunning}
          error={ingest.error}
          onStart={() => void ingest.start()}
        />
        <SourcesList
          sources={sources.sources}
          loading={sources.loading}
          error={sources.error}
          onRemove={(p) => void sources.remove(p)}
        />
      </section>
    </main>
  );
}
