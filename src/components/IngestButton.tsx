import type { IngestStatusResponse } from "../api/types";

interface Props {
  status: IngestStatusResponse | null;
  isRunning: boolean;
  error: string | null;
  onStart: () => void;
}

export function IngestButton({ status, isRunning, error, onStart }: Props) {
  return (
    <div className="ingest">
      <button type="button" onClick={onStart} disabled={isRunning}>
        {isRunning ? "Scanning…" : "Re-scan documents"}
      </button>

      {error && (
        <p className="panel panel--error" role="alert">
          {error}
        </p>
      )}

      {status?.status === "completed" && (
        <p role="status" className="muted">
          Scanned {status.files_scanned} files: {status.files_indexed} indexed,{" "}
          {status.files_unchanged} unchanged, {status.files_skipped} skipped.
        </p>
      )}

      {status?.status === "completed" && status.skipped_files.length > 0 && (
        <details>
          <summary>Skipped files ({status.skipped_files.length})</summary>
          <ul>
            {status.skipped_files.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </details>
      )}

      {status?.status === "failed" && (
        <p className="panel panel--error" role="alert">
          Scan failed{status.error ? `: ${status.error}` : "."}
        </p>
      )}
    </div>
  );
}
