# syntax=docker/dockerfile:1.7
# Build from the repo root: docker build -f packages/api/Dockerfile -t fitcoach-api .

ARG NODE_VERSION=20-alpine

# All four workspace manifests: npm ci reifies the whole locked tree.
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
# Build script also copies openapi.yaml into dist/ — app.ts reads it at import.
RUN npm run build --workspace=@starter-kit/api

FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Whole prod tree, not just root node_modules: api nests its own js-yaml major.
# Also brings the manifests the @starter-kit/* workspace symlinks resolve through.
COPY --from=prod-deps --chown=node:node /app ./
COPY --from=build --chown=node:node /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=node:node /app/packages/api/dist    ./packages/api/dist

USER node
EXPOSE 3000

# Drop this under k8s/ECS and use platform probes instead.
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "packages/api/dist/server.js"]
