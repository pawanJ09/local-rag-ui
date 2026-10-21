// The ONLY module that makes HTTP calls. It knows nothing about React or the
// DOM, so it can be reused as-is in a future React Native app.
import type {
  ConfigResponse,
  DeleteSourceResponse,
  HealthResponse,
  IngestStatusResponse,
  IngestTriggerResponse,
  QueryResponse,
  SourcesListResponse,
} from "./types";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, message: string, detail: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  apiKey: string;
  /** Injectable for tests; defaults to the global fetch. */
  fetchFn?: typeof fetch;
}

export interface ApiClient {
  health(): Promise<HealthResponse>;
  query(question: string): Promise<QueryResponse>;
  startIngest(): Promise<IngestTriggerResponse>;
  getIngestStatus(jobId: string): Promise<IngestStatusResponse>;
  listSources(): Promise<SourcesListResponse>;
  deleteSource(sourcePath: string): Promise<DeleteSourceResponse>;
  getConfig(): Promise<ConfigResponse>;
}

export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Something went wrong.";
}

function messageForStatus(status: number, detail: unknown): string {
  if (status === 401) return "The API key was rejected. Check the key configured for this UI.";
  if (status === 404) return typeof detail === "string" ? detail : "Not found.";
  if (status === 422) return "The backend rejected that request as invalid.";
  if (typeof detail === "string") return detail;
  return `Request failed (HTTP ${status}).`;
}

export function createApiClient({ baseUrl, apiKey, fetchFn }: ApiClientOptions): ApiClient {
  const root = baseUrl.replace(/\/+$/, "");

  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const doFetch = fetchFn ?? globalThis.fetch.bind(globalThis);
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-API-Key": apiKey,
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";

    let response: Response;
    try {
      response = await doFetch(`${root}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(
        0,
        `Cannot reach the backend at ${root}. Is it running, and does its ALLOWED_ORIGINS include this page's address?`,
      );
    }

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const detail =
        data && typeof data === "object" && "detail" in data
          ? (data as { detail: unknown }).detail
          : null;
      throw new ApiError(response.status, messageForStatus(response.status, detail), detail);
    }
    return data as T;
  }

  return {
    health: () => request<HealthResponse>("GET", "/health"),
    query: (question) => request<QueryResponse>("POST", "/query", { question }),
    startIngest: () => request<IngestTriggerResponse>("POST", "/ingest"),
    getIngestStatus: (jobId) =>
      request<IngestStatusResponse>("GET", `/ingest/status/${encodeURIComponent(jobId)}`),
    listSources: () => request<SourcesListResponse>("GET", "/sources"),
    deleteSource: (sourcePath) =>
      request<DeleteSourceResponse>(
        "DELETE",
        // Keep the slashes of nested paths, encode everything else.
        `/sources/${sourcePath.split("/").map(encodeURIComponent).join("/")}`,
      ),
    getConfig: () => request<ConfigResponse>("GET", "/config"),
  };
}
