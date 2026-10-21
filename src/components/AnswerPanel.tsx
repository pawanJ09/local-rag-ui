import type { QueryResponse } from "../api/types";

interface Props {
  result: QueryResponse | null;
  loading: boolean;
  error: string | null;
}

export function AnswerPanel({ result, loading, error }: Props) {
  if (loading) {
    return (
      <div className="panel" role="status">
        Searching your documents…
      </div>
    );
  }
  if (error) {
    return (
      <div className="panel panel--error" role="alert">
        {error}
      </div>
    );
  }
  if (!result) return null;

  const grounded = result.grounded;

  return (
    <section
      className={grounded ? "panel panel--answer" : "panel panel--ungrounded"}
      data-testid={grounded ? "answer-grounded" : "answer-ungrounded"}
    >
      {!grounded && <p className="badge">Not found in your documents</p>}
      <p className="answer-text">{result.answer}</p>

      {result.sources.length > 0 && (
        <details>
          <summary>
            {grounded ? "Sources used" : "Closest matches"} ({result.sources.length})
          </summary>
          <ul className="source-chunks">
            {result.sources.map((s) => (
              <li key={s.chunk_id}>
                <strong>{s.source_path}</strong>
                <span className="muted"> · distance {s.distance.toFixed(2)}</span>
                <blockquote>{s.excerpt}</blockquote>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
