.PHONY: install dev build test typecheck docker-build docker-run types

install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm test

typecheck:
	npm run typecheck

docker-build:
	docker build -t local-rag-ui .

# Reads API_BASE_URL and API_KEY from .env. Open http://localhost:3000.
# The backend's ALLOWED_ORIGINS must include http://localhost:3000.
docker-run:
	@test -f .env || (echo "Copy .env.example to .env first" && exit 1)
	docker run --rm -p 3000:80 --env-file .env local-rag-ui

# Optional: regenerate types from a running backend into src/api/generated.ts
types:
	npx openapi-typescript http://localhost:8000/openapi.json -o src/api/generated.ts
