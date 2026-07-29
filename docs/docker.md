# Docker

How the API and workers images are built, why they are built that way, and how to run the stack.

## Running the stack

```bash
docker compose up --build
```

Brings up `postgres`, `redis`, `api`, `workers` and `web`. The app is then at `http://localhost:${WEB_PORT:-8080}`.

Startup is ordered by healthcheck, not by launch: `api` and `workers` wait for healthy datastores, and `web` waits for a healthy `api`. So a cold start cannot race the database.

Building a single image by hand — note the trailing `.`, the context must be the **repo root**, not the package folder:

```bash
docker build -f packages/api/Dockerfile     -t fitcoach-api .
docker build -f packages/workers/Dockerfile -t fitcoach-workers .
docker build -f packages/web/Dockerfile     -t fitcoach-web \
  --build-arg VITE_GOOGLE_CLIENT_ID=your-client-id .
```

Building from inside `packages/api/` fails: the Dockerfile copies `package-lock.json` and sibling workspace manifests from the root, and none of those are visible from a package-level context.

### Required environment

`docker-compose.yml` reads the root `.env`. `JWT_SECRET` and `JWT_REFRESH_SECRET` are declared with the `${VAR:?message}` form, so compose refuses to start with a clear error rather than booting an API that signs tokens with `undefined`. Everything else has a default.

### Port conflicts with other local stacks

`API_PORT`, `POSTGRES_PORT` and `REDIS_PORT` control only the **host-published** side of each mapping. Container-internal ports are fixed, and the services address each other by name over the compose network, so changing these affects nothing but your own machine.

If `docker compose up` fails with `Bind for 0.0.0.0:<port> failed: port is already allocated`, another container or a locally installed service owns that port. Find it:

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Then either stop the other stack (`docker compose -p <project> down`) or set the matching `*_PORT` in `.env` to something free. Compose reports only the first collision it hits, so expect to resolve them one at a time.

### Datastore URLs

`DATABASE_URL` and `REDIS_URL` are **not** taken from `.env`. Compose overrides them to point at the `postgres` and `redis` service names, because `.env` holds `localhost` URLs for host-side development. Inside a container, `localhost` is that container — the values must differ, so they are set in the compose file rather than inherited.

## Image layout

Both Dockerfiles are multi-stage. Only the final `runtime` stage becomes the shipped image; the earlier stages are build scaffolding that Docker discards.

| Stage | Contents |
| --- | --- |
| `manifests` | The four workspace `package.json` files plus the root lockfile |
| `deps` | Full `npm ci` — includes TypeScript, jest, eslint |
| `prod-deps` | `npm ci --omit=dev` — no compiler, no types, no test tooling |
| `build` | Source + `deps`, runs `tsc`, emits `dist/` |
| `runtime` | Fresh `node:20-alpine`; receives only prod deps and `dist/` |

`runtime` starts from a clean `FROM` and inherits nothing. No `.ts` file and no TypeScript compiler reaches the published image.

`manifests` exists as a shared base so that the dependency layers invalidate only when a manifest or the lockfile changes. Editing application source does not re-run `npm ci`.

### Why the runtime stage copies the whole `/app` tree

```dockerfile
COPY --from=prod-deps --chown=node:node /app ./
```

Not just `node_modules`. npm workspaces installs `@starter-kit/shared` as a **symlink** from `node_modules/@starter-kit/shared` to `packages/shared/`. When Node resolves `require("@starter-kit/shared")` it follows that symlink and reads `packages/shared/package.json` to find the `main` entry. If that manifest is absent from the runtime stage, resolution fails even though `packages/shared/dist` is present.

This is exactly what was wrong with the pre-existing `packages/workers/Dockerfile`: it copied `packages/workers/package.json` into the runner but never `packages/shared/package.json`.

Copying the whole tree also preserves nested `node_modules` — the API pins a `js-yaml` major that differs from the hoisted root version, and a root-only copy would silently give it the wrong one.

## The web image

Unlike the API and workers, the frontend is not a Node process. `vite build` emits static files, which nginx serves. Two things that follow from that:

**SPA routing.** react-router owns paths like `/dashboard` that correspond to no file on disk. `try_files $uri $uri/ /index.html` makes nginx fall through to the shell so a deep link or hard refresh works.

**The `/api` proxy.** `packages/web/src/lib/api-client.ts` sets `baseURL: "/api"` — a same-origin relative path. In development the Vite dev server proxies that to the API. In production there is no Vite, so nginx has to do it. Requests are therefore same-origin and CORS is never exercised through the web container; `CORS_ORIGIN` only matters when something calls the API directly.

nginx resolves the `api` hostname once at startup and exits if it cannot, which is why the `web` service depends on a *healthy* api rather than a merely started one.

The runtime stage uses `nginxinc/nginx-unprivileged` rather than stock `nginx`. The official image runs its master process as root and would be the only container in the stack doing so; the unprivileged variant runs as uid 101 and listens on 8080.

### Why the build stage copies `packages/shared/config`

`packages/web/tsconfig.json` extends `../shared/config/tsconfig.base.json`, so `npm run build` (which runs `tsc` before `vite build`) fails without it. No workspace *code* is imported by the bundle, so nothing else from `packages/shared` is needed.

### `VITE_GOOGLE_CLIENT_ID` and build-time inlining

Browsers have no `process.env`, so Vite does textual substitution during the build: `import.meta.env.VITE_GOOGLE_CLIENT_ID` is replaced with a string literal in the emitted bundle. The value is welded into the JavaScript and cannot be changed at container start.

The consequence is that the web image is environment-specific — a different client ID requires a rebuild, which breaks the usual build-once-promote-everywhere model. The image is built with `ARG VITE_GOOGLE_CLIENT_ID` anyway, for two reasons:

- A Google OAuth client ID is public by design. It is transmitted to every browser that loads the page, so there is nothing to protect by keeping it out of image layers. A genuine secret would never be in the bundle in the first place.
- It is the only runtime-varying value the frontend has. The alternative — an entrypoint script that writes `/env.js` at container start, read via `window.__ENV__` — costs an extra file, a render-blocking script tag and hand-written `window` typings to solve a problem of exactly one variable.

If the number of environment-varying values grows, switch to the `/env.js` approach; the tradeoff stops being favourable quickly.

Compose declares the build arg with `${VITE_GOOGLE_CLIENT_ID:?...}`, so a missing value fails the build with a clear message rather than producing a bundle that renders and then fails inside Google's SDK.

The value lives in the **root** `.env`, not `packages/web/.env`. Compose interpolates only from the root, and `packages/web/vite.config.ts` sets `envDir` to the repo root so `npm run dev` reads the same file. One variable in two files is a drift waiting to happen.

Pointing Vite at the root `.env` does not expose the server secrets stored there: only `VITE_`-prefixed variables are injected into the client bundle. The unprefixed `loadEnv(mode, ..., "")` call in `vite.config.ts` reads everything, but that runs at config time in Node and nothing from it reaches the browser.

## Why `packages/shared/package.json` points `main` at `dist`

```diff
-  "main":  "./src/index.ts",
-  "types": "./src/index.ts",
+  "main":  "./dist/src/index.js",
+  "types": "./dist/src/index.d.ts",
```

`main` is read by exactly one thing: Node's runtime module resolver. Nothing in the day-to-day workflow reaches it, which is why the original value survived so long.

- **`npm run dev`** (`tsx watch`) resolves through the `paths` alias in `packages/api/tsconfig.json`, which points straight at `../shared/src/index.ts`. `main` is never opened, and `tsx` executes TypeScript natively.
- **`npm run build`** (`tsc -p tsconfig.build.json`) overrides `paths` to `../shared/dist/src/index.d.ts` for type-checking only. `main` is never opened.
- **`node dist/server.js`** — the container's `CMD`, and `npm start` — has no tsconfig. `tsc` does *not* rewrite import specifiers when it emits, so the compiled JS still contains the literal `require("@starter-kit/shared")`. Node resolves it through the symlink and reads `main`. Pointing at a `.ts` file throws `ERR_UNKNOWN_FILE_EXTENSION`.

So `npm start` was already broken before any of this; containerising the API is simply the first thing that ever executed the compiled output.

The `dist/`**`src`**`/index.js` path is not a typo. `packages/shared/tsconfig.build.json` sets `rootDir: "./"` and includes five top-level folders (`src`, `auth`, `ai`, `queue`, `db`), so `tsc` preserves that structure beneath `dist/`.

## Why `@types/cookie-parser` moved to `devDependencies`

`prod-deps` runs `npm ci --omit=dev`. A `@types/*` package is erased at compile time and contributes nothing at runtime, so leaving it in `dependencies` shipped it — and its peer `@types/express`, and that package's own transitive `@types/*` — into the production image. It was also the only `@types/*` entry in `packages/api/package.json` filed under `dependencies`.

The accompanying `package-lock.json` diff is not an independent change: it is npm re-flagging those transitive type packages as `"dev": true`.

## Known limitations

- **`npm ci` runs twice** (`deps` and `prod-deps`), roughly doubling cold-build time. The two trees genuinely differ and BuildKit runs the stages in parallel, but it doubles exposure to registry flakiness. Worth revisiting if build time becomes a problem.
- **The API image carries the frontend's dependencies.** `npm ci --omit=dev` at the workspace root installs the production deps of *every* workspace, so `react`, `react-dom`, `react-router-dom` and `axios` sit unused inside the API image. Scoping the install with `--workspace=@starter-kit/api --workspace=@starter-kit/shared --include-workspace-root` would trim it.
- **Migrations cannot run from the image.** `sequelize-cli` is a `devDependency` and is therefore absent from the runtime stage. Migrations are expected to run as a separate job rather than on container start.
- **The web image is environment-specific.** See the `VITE_GOOGLE_CLIENT_ID` section above.
- **The workers image has no `HEALTHCHECK`.** The process serves no port, so there is nothing to probe over HTTP. A meaningful check would have to assert the BullMQ/Redis connection; under an orchestrator, prefer a platform liveness probe.

## `.dockerignore`

Excludes `node_modules`, build output, `.git`, docs and editor files from the build context. Two entries that look wrong but are deliberate:

- `**/Dockerfile` — the Dockerfile is supplied by `-f` from the host and is never read out of the context, so excluding it prevents a pointless context invalidation.
- `.env.*` — matches `.env.example` too. Nothing in the `.env*` family belongs in a build context.
