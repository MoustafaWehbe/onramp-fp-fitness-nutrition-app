# syntax=docker/dockerfile:1.7
# Build context is the repo root. See docs/docker.md.

ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS manifests
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/api/package.json     ./packages/api/
COPY packages/web/package.json     ./packages/web/
COPY packages/workers/package.json ./packages/workers/
COPY packages/shared/package.json  ./packages/shared/

FROM manifests AS deps
RUN --mount=type=cache,target=/root/.npm npm ci

FROM manifests AS prod-deps
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

FROM deps AS build
WORKDIR /app
COPY packages/shared ./packages/shared
COPY packages/api    ./packages/api
# shared first: api's tsconfig.build.json aliases it to ../shared/dist/src.
RUN npm run build --workspace=@starter-kit/shared
RUN npm run build --workspace=@starter-kit/api

FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Whole prod tree, not just node_modules: it carries the workspace package.json
# files that the @starter-kit/* symlinks resolve `main` through.
COPY --from=prod-deps --chown=node:node /app ./
COPY --from=build --chown=node:node /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=node:node /app/packages/api/dist    ./packages/api/dist

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "packages/api/dist/server.js"]
