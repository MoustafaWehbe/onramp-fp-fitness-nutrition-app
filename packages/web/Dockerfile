# syntax=docker/dockerfile:1.7
# Build context is the repo root. See docs/docker.md.

ARG NODE_VERSION=20-alpine
ARG NGINX_VERSION=1.27-alpine

FROM node:${NODE_VERSION} AS manifests
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/api/package.json     ./packages/api/
COPY packages/web/package.json     ./packages/web/
COPY packages/workers/package.json ./packages/workers/
COPY packages/shared/package.json  ./packages/shared/

FROM manifests AS deps
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS build
WORKDIR /app
# Only shared's tsconfig base is needed -- web extends it but imports no
# workspace code, so the rest of packages/shared stays out of this stage.
COPY packages/shared/config ./packages/shared/config
COPY packages/web ./packages/web

# Vite inlines VITE_* into the bundle at build time, so the resulting image is
# environment-specific. See docs/docker.md for why that is acceptable here.
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build --workspace=@starter-kit/web

# Unprivileged variant: runs as uid 101 on port 8080 with no root master
# process, matching the USER node stance of the api and workers images.
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runtime
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/web/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
