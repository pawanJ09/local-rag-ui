import type { SourceInfo } from "../api/types";

interface Props {
  sources: SourceInfo[];
  loading: boolean;
  error: string | null;
  onRemove: (sourcePath: string) => void;
}

export function SourcesList({ sources, loading, error, onRemove }: Props) {
  return (
    <section aria-labelledby="sources-heading">
      <h2 id="sources-heading">Indexed documents</h2>
      {error && (
        <p className="panel panel--error" role="alert">
          {error}
        </p>
      )}
      {loading && sources.length === 0 && <p role="status">Loading…</p>}
      {!loading && !error && sources.length === 0 && (
        <p className="muted">
          No documents indexed yet. Add files to your documents folder, then click Re-scan.
        </p>
      )}
      {sources.length > 0 && (
        <ul className="sources">
          {sources.map((s) => (
            <li key={s.source_path}>
              <span className="source-name">{s.source_path}</span>
              <span className="muted">{s.chunk_count} chunks</span>
              <button
                type="button"
                className="link-button"
                onClick={() => onRemove(s.source_path)}
                aria-label={`Remove ${s.source_path} from the index`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
