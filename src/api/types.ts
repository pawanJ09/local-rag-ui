// Hand-written to match the backend's app/models.py (the API contract).
// `make types` can regenerate types from /openapi.json into generated.ts.

export interface HealthResponse {
  status: string;
  ollama_reachable: boolean;
  chroma_reachable: boolean;
}

export interface SourceChunk {
  source_path: string;
  chunk_id: string;
  excerpt: string;
  distance: number;
}

export interface QueryResponse {
  answer: string;
  sources: SourceChunk[];
  grounded: boolean;
}

export interface IngestTriggerResponse {
  job_id: string;
  status: string;
}

export type JobStatus = "queued" | "running" | "completed" | "failed";

export interface IngestStatusResponse {
  job_id: string;
  status: JobStatus;
  files_scanned: number;
  files_indexed: number;
  files_skipped: number;
  files_unchanged: number;
  skipped_files: string[];
  error: string | null;
}

export interface SourceInfo {
  source_path: string;
  chunk_count: number;
  file_hash: string;
  last_indexed: string;
}

export interface SourcesListResponse {
  sources: SourceInfo[];
}

export interface DeleteSourceResponse {
  deleted: string;
}

export interface ConfigResponse {
  embedding_model: string;
  llm_model: string;
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  similarity_distance_threshold: number;
  allowed_extensions: string[];
}
