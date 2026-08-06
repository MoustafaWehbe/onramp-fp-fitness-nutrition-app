# Changelog

All notable changes to this project are documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!--
How to update this file:

- Add every user-facing change under `## [Unreleased]` as part of the PR that makes it.
- Use only these headings, in this order, and omit the ones with no entries:
  Added, Changed, Deprecated, Removed, Fixed, Security.
- Write for someone using the project, not for someone reading the diff.
  Say what changed and why it matters; skip refactors nobody can observe.
- On release: rename `[Unreleased]` to `[x.y.z] - YYYY-MM-DD`, open a fresh
  empty `[Unreleased]` above it, and update the link definitions at the bottom.
  A version marks a point in the history worth naming. It does not require a
  deployment.
-->

## [Unreleased]

### Added

- Coach role, and the schema behind it: `user_profiles`, `coach_profiles` and
  `coach_requests`, plus coach ownership, status and originating request on
  `programs`.
- Coach discovery at `GET /coaches`, returning the fields the listing shows —
  photo, name, gender, age, years of experience and rating.
- Coach profile management at `GET`/`PATCH /coach-profile`.
- Coach request flow: a client sends a request with an optional message, and the
  coach it was addressed to can accept or decline it.

### Security

- Coach discovery no longer returns every coach's email address to any signed-in
  user.
- A coach can no longer set their own `rating` or `clientsCount` by including
  them in a profile update; editable fields are allowlisted.
- Demo coach accounts share one password and are sign-in ready, so seeding them
  outside development now requires `SEED_COACH_PASSWORD` and fails without it.

### Fixed

- A client could end up with several pending coach requests at once. The
  one-at-a-time rule is now held by a partial unique index rather than by a
  read-then-insert that two concurrent requests could both pass.
- Rolling back the coach profile seeder deleted every coach profile, including
  real ones.

## [0.1.0] - 2026-08-05

First tagged version. Changes before this point are not recorded here; the
changelog starts with the containerisation work (PR #20).

### Added

- Multi-stage `Dockerfile` for the API. Only production dependencies and compiled
  `dist/` output reach the shipped image no TypeScript sources and no compiler.
- Multi-stage `Dockerfile` for the web frontend, served by `nginx-unprivileged`
  (runs as uid 101 on port 8080). Includes an SPA fallback so deep links and hard
  refreshes work, and an `/api` reverse proxy so browser requests stay same-origin.
- `docker-compose.yml` running `postgres`, `redis`, `api`, `workers` and `web`.
  Startup is ordered by healthcheck rather than launch order, so a cold start
  cannot race the database.
- `VITE_GOOGLE_CLIENT_ID` as a build argument on the web image. Compose fails the
  build with an explicit message when it is unset, instead of producing a bundle
  that renders and then breaks inside Google's SDK.

  **Action required.** The app is now reachable on a second port, and Google
  matches authorised origins as exact `scheme://host:port` strings, so `localhost`
  and `127.0.0.1` count as different origins. Add all four to Google Cloud Console
  -> Credentials -> your OAuth client -> Authorised JavaScript origins, or Google
  rejects the request with `origin_mismatch` ("The given origin is not allowed for
  the given client ID"):

  | Origin | Used by |
  | --- | --- |
  | `http://localhost:5173` | `npm run dev` |
  | `http://127.0.0.1:5173` | `npm run dev` (the address Vite binds and prints) |
  | `http://localhost:8080` | `docker compose up` (`WEB_PORT` default) |
  | `http://127.0.0.1:8080` | `docker compose up` |

  Because Vite inlines the value at build time, changing the client ID requires
  `docker compose build web` -- a container restart will not pick it up.
- Root `.dockerignore`.
- `docs/docker.md` covering image layout, required environment, port-conflict
  resolution and known limitations.
- `.github/PULL_REQUEST_TEMPLATE.md`.
- Solution section on the landing page.

### Changed

- Rebranded the application to FitCoach.
- `@starter-kit/shared` now resolves to its compiled output: `main` and `types`
  point at `dist/` instead of `src/`. Running the built app (`npm start`, and the
  container `CMD`) previously failed with `ERR_UNKNOWN_FILE_EXTENSION`.
- Vite reads environment variables from the repository root, so a single root
  `.env` serves both Vite and Compose.
- `@types/cookie-parser` moved from `dependencies` to `devDependencies` in the API
  package, keeping type-only packages and their transitive types out of the
  production image.

### Fixed

- Workers container could not start: the runtime stage never copied
  `packages/shared/package.json`, so `require("@starter-kit/shared")` failed to
  resolve through the workspace symlink.
- Google sign-in failing in development with
  `invalid_request: Missing required parameter: client_id`. The Vite wrapper
  scripts pass `configFile: false` and therefore ignored the `envDir` set in
  `vite.config.ts`, leaving `VITE_GOOGLE_CLIENT_ID` undefined. `envDir` is now set
  in `scripts/vite-dev.mjs` and `scripts/vite-build.mjs` as well.
- API request log no longer records the container healthcheck probe on every tick.

[Unreleased]: https://github.com/MoustafaWehbe/onramp-fp-fitness-nutrition-app/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/MoustafaWehbe/onramp-fp-fitness-nutrition-app/releases/tag/v0.1.0
