# ---- build stage ----
# Always runs on the build machine's own chip (BUILDPLATFORM), even when the image
# is being built for another one. The output is plain HTML/JS/CSS, which is the
# same for every platform, so there is no need to run npm under emulation.
FROM --platform=$BUILDPLATFORM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Uses the lockfile when present (reproducible); falls back to npm install.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker-entrypoint.d/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh
EXPOSE 80
