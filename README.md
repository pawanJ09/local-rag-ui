# local-rag-ui

React + TypeScript web client for `local-rag-backend`. It only talks to the
backend's REST API. It never touches Ollama or Chroma.

## Run it (Docker, the way most people will)

```bash
docker run --rm -p 3000:80 \
  -e API_BASE_URL=http://localhost:8000 \
  -e API_KEY=<the API_KEY from the backend's .env> \
  ghcr.io/<owner>/local-rag-ui:latest
```

Open http://localhost:3000.

The backend must allow that address. In the backend's `.env` set
`ALLOWED_ORIGINS=http://localhost:3000` and run `docker compose up -d`.
Otherwise the browser blocks the requests and the UI shows
"Cannot reach the backend".

`API_BASE_URL` and `API_KEY` are read when the container starts, not baked into
the image, so one published image works for everyone. The same two settings are
used by `make dev` (from `.env`), so there is only one pair of names to remember.

## Develop

```bash
cp .env.example .env     # API_BASE_URL and API_KEY (same names as Docker)
make install             # npm install (creates package-lock.json, commit it)
make dev                 # http://localhost:5173
make test                # vitest
make typecheck           # tsc --noEmit
```

The backend's default `ALLOWED_ORIGINS` already includes `http://localhost:5173`.

## How it is organised

| Folder | Job | Rules |
|---|---|---|
| `src/api/client.ts` | The only place that makes HTTP calls | No React, no DOM |
| `src/hooks/` | Loading, error and polling state around the client | No DOM; take the client as an argument |
| `src/components/` | Draw things from props | Never fetch |
| `src/pages/Home.tsx` | Puts hooks and components together | |
| `src/config.ts` | Reads the runtime settings from `window` | The only file that touches the browser for config |

`api/` and `hooks/` stay free of browser-specific code so they can be reused in
a React Native app later.

## Notes and deviations from the checklist

- **Runtime config instead of build-time env.** In Docker, a small script writes
  `config.js` from `API_BASE_URL` / `API_KEY` when the container starts. This is
  why `nginx.conf`, `docker-entrypoint.d/`, `public/config.js` and `src/config.ts`
  exist. They were not in the original file list.
- **Extra files not in the original list:** `tsconfig.json`, `src/index.css`,
  `src/test/setup.ts`, `src/test/helpers.ts` and the test files.
- **The API key is visible to anyone who can open the UI.** Fine for a tool on
  your own machine. It is not per-user security.
- **Types are hand-written** in `src/api/types.ts` to match the backend. Run
  `make types` against a running backend to generate them into
  `src/api/generated.ts` and compare.
- **Tests inject a fake `fetch`** instead of using MSW, to keep dependencies small.
- **No `package-lock.json` yet.** Run `make install` once and commit the file.
  The Dockerfile uses it when present and falls back to `npm install`.
- **`SourcesList` shows the indexed files** (`GET /sources`). The chunks used for
  an answer appear inside `AnswerPanel` under "Sources used".
