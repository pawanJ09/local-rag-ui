#!/bin/sh
# Runs automatically when the nginx container starts. Writes config.js from
# environment variables so ONE published image works for everyone, each with
# their own backend URL and API key.
set -e

# Escape backslashes and double quotes so the values are safe inside a JS string.
esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

BASE="$(esc "${API_BASE_URL:-http://localhost:8000}")"
KEY="$(esc "${API_KEY:-}")"

cat > /usr/share/nginx/html/config.js <<JS
window.__RAG_CONFIG__ = { apiBaseUrl: "$BASE", apiKey: "$KEY" };
JS
