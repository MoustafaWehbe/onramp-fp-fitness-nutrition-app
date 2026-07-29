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
COPY packages/shared  ./packages/shared
COPY packages/workers ./packages/workers
# shared first: workers' tsconfig.build.json aliases it to ../shared/dist/src.
RUN npm run build --workspace=@starter-kit/shared
RUN npm run build --workspace=@starter-kit/workers

FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Whole prod tree, not just node_modules: it carries the workspace package.json
# files that the @starter-kit/* symlinks resolve `main` through.
COPY --from=prod-deps --chown=node:node /app ./
COPY --from=build --chown=node:node /app/packages/shared/dist  ./packages/shared/dist
COPY --from=build --chown=node:node /app/packages/workers/dist ./packages/workers/dist

USER node

CMD ["node", "packages/workers/dist/index.js"]
