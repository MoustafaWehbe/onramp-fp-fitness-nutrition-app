## Summary

Containerizes the API, workers and web packages, and wires all three into 
docker-compose alongside the existing postgres and redis services.

## Why

Only postgres and redis were runnable via compose. `packages/workers/Dockerfile`
existed but came in with the initial scaffold (2cf199c) and had never been built.

## Changes

  | Area | Change |
  | --- | --- |
  | `packages/api/Dockerfile` | New. Multi-stage, prod-only deps, non-root, healthcheck |
  | `packages/workers/Dockerfile` | Fixed unresolvable `@starter-kit/shared`; parity with api |
  | `packages/web/Dockerfile` + `nginx.conf` | New. Static build, SPA fallback, `/api` proxy |
  | `packages/shared/package.json` | `main`/`types` -> compiled output |
  | `packages/api/package.json` | `@types/cookie-parser` -> devDependencies |
  | `docker-compose.yml` | Added api, workers, web; parameterized published ports |
  | `packages/api/app.ts` | Skip `/health` in request log; `combined` format in prod |
  | `docs/docker.md` | New. Full rationale and known limitations |

  Two changes look unrelated to Docker but are load-bearing:

  - **`shared`'s `main`** pointed at `./src/index.ts`. Nothing read it before —
    `npm run dev` resolves via the tsconfig `paths` alias, and `tsc` type-checks
    against `.d.ts`. But `tsc` does not rewrite import specifiers, so compiled JS
    still emits `require("@starter-kit/shared")`, which Node resolves through the
    workspace symlink to that `main`. `npm start` was already broken before this
    PR; containerizing is what executed the compiled output for the first time.
  - **`@types/cookie-parser`** was the only `@types/*` under `dependencies`, so
    `npm ci --omit=dev` shipped it and its transitive types into the image.
    The `package-lock.json` diff is npm re-flagging those as `"dev": true`.

## Verification

docker build -f packages/api/Dockerfile     -t fitcoach-api .        # ok
docker build -f packages/workers/Dockerfile -t fitcoach-workers .    # ok
docker compose config --quiet                                        # ok

docker run --rm fitcoach-workers node -e "require('@starter-kit/shared'); console.log('shared resolved OK')"
shared resolved OK      # this threw MODULE_NOT_FOUND before

docker compose up --build
postgres healthy -> redis healthy -> api "Database connection established"
workers "Started 2 worker(s): email, embeddings"

## Notes for the reviewer

  - `npm ci` runs twice per image (`deps` and `prod-deps`). The trees genuinely
    differ and BuildKit parallelizes the stages, but it doubles cold-build time.
  - The API image carries the frontend's prod deps, because `--omit=dev` at the
    workspace root installs every workspace. Scoping with `--workspace` would trim
    it; left as a follow-up to keep this diff focused.
  - Migrations cannot run from the API image — `sequelize-cli` is a devDependency.
    Intended to run as a separate job, not on container start.
  - The web image is environment-specific: Vite inlines `VITE_*` at build time.
    Accepted because a Google client ID is public and it is the only such value.
    Rationale and the `/env.js` alternative are in `docs/docker.md`.
  - `DATABASE_URL`/`REDIS_URL` are set in compose rather than inherited from
    `.env`, which holds `localhost` URLs for host-side dev.



