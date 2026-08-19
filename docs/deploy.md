# Deploy

Production deployment to a DigitalOcean droplet, served at `https://fitcoach.ten-ten.live`.

For how the images themselves are built and why, see [docker.md](./docker.md). This document
covers only the production stack.

## Topology

```
Internet :443 ─▶ caddy      TLS termination, automatic Let's Encrypt
                  └─▶ web:8080      nginx: SPA fallback + /api proxy
                        └─▶ api:3000
                              ├─▶ postgres:5432
                              └─▶ redis:6379
        workers ──────────────┘
```

`caddy` is the only service that publishes ports to the internet. `postgres` publishes to the
droplet's loopback interface only; `redis`, `api` and `web` publish nothing and are reachable
only over the compose network.

## Why images are pulled, never built here

The droplet has 1 GB of RAM. `packages/api/Dockerfile` and `packages/workers/Dockerfile` each
run `npm ci` twice (`deps` and `prod-deps`) plus `tsc`, and `packages/web/Dockerfile` adds
`vite build` — together 2–3 GB. Builds happen on a developer machine and the results are pulled
from Docker Hub.

`docker-compose.prod.yml` therefore contains no `build:` blocks at all. It is not a variant of
the dev compose file that can fall back to building.

## HTTPS is mandatory, not hardening

Two independent reasons, both fatal on plain HTTP:

- `packages/api/src/controllers/auth.controller.ts` sets `secure: isProduction` on the access
  and refresh cookies, and compose sets `NODE_ENV=production`. Over HTTP the browser discards
  them silently: login returns 200 and the user stays logged out.
- Google Identity Services only accepts HTTPS JavaScript origins, `localhost` excepted.

## Prerequisites

- Droplet `ubuntu-s-1vcpu-1gb-fra1` at `159.89.16.150` — Ubuntu 24.04, Basic/Regular
  1 GB / 1 vCPU / 25 GB (`s-1vcpu-1gb`, $6/mo), Frankfurt
- DO Cloud Firewall attached, inbound TCP 22, 80, 443 only
- DNS: `fitcoach.ten-ten.live` A record → droplet IP, resolving before first boot (Caddy needs
  it to answer the ACME HTTP-01 challenge). DNS is hosted at name.com; there is no wildcard
  record on `ten-ten.live` and no Cloudflare proxy in front, so HTTP-01 reaches the droplet
  directly.
- `https://fitcoach.ten-ten.live` registered as an Authorized JavaScript origin on the Google
  OAuth client whose ID was baked into the web image
- Images pushed: `youssefalmostafa/fitcoach-{api,workers,web}:latest`

## Droplet preparation

### First connection

SSH asks you to accept the host key on first connect. Verify it out of band rather than
accepting blind — open the droplet's browser console from the DigitalOcean control panel
(**Access → Launch Droplet Console**), which reaches the droplet through the hypervisor rather
than SSH, and run:

```bash
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Compare that fingerprint with the one `ssh root@159.89.16.150` is showing, then answer `yes`.

Two things that look like failures but are not:

- `Connection closed by <ip> port 22` on the first attempt usually means cloud-init was still
  writing `/root/.ssh/authorized_keys` when sshd accepted the connection. Retry.
- `REMOTE HOST IDENTIFICATION HAS CHANGED` after a droplet rebuild is expected — clear it with
  `ssh-keygen -R 159.89.16.150`. If it appears when you have *not* rebuilt, stop and investigate.

### Swap

Droplets ship with no swap. The stack idles around 600–700 MB of ~980 MB usable, so a spike
without swap gets a container OOM-killed rather than slowed down.

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf
sysctl -p /etc/sysctl.d/99-swap.conf
```

### System updates

A fresh droplet image is typically a month or two behind on security patches. `DEBIAN_FRONTEND`
stops Ubuntu 24.04's `needrestart` from opening a blocking "restart these services?" dialog.

```bash
export DEBIAN_FRONTEND=noninteractive
apt-get update && apt-get -y upgrade
```

### Docker

From Docker's own apt repository — the distro package and the Marketplace image both lag.

```bash
apt-get update
apt-get install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Source

Only `docker-compose.prod.yml` and `Caddyfile` are actually needed on the droplet, but cloning
keeps redeploys to a `git pull`.

```bash
git clone -b deploy https://github.com/MoustafaWehbe/onramp-fp-fitness-nutrition-app.git /opt/fitcoach
cd /opt/fitcoach
```

## Environment

`.env` is not committed. Create it at the repo root on the droplet:

```bash
rm -f /opt/fitcoach/.env
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=')" > /opt/fitcoach/.env
echo "JWT_SECRET=$(openssl rand -hex 48)" >> /opt/fitcoach/.env
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 48)" >> /opt/fitcoach/.env
echo "CORS_ORIGIN=https://fitcoach.ten-ten.live" >> /opt/fitcoach/.env
chmod 600 /opt/fitcoach/.env
```

One `echo` per line rather than a heredoc on purpose. Terminals with bracketed paste can indent
pasted lines, and an indented `EOF` no longer terminates a heredoc — the shell then swallows
`chmod` and everything after it as more heredoc body. Independent lines paste safely at any
indentation. Note the first line uses `>` and the rest `>>`.

Read the password back with `grep POSTGRES /opt/fitcoach/.env` rather than `cat`, so the JWT
secrets stay off the screen.

`POSTGRES_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET` and `CORS_ORIGIN` use the `${VAR:?}`
form in compose, so a missing value fails fast with a named error instead of booting an API that
signs tokens with `undefined`. Everything else has a default.

Add `OPENROUTER_API_KEY` if the AI assistant should work.

`VITE_GOOGLE_CLIENT_ID` is deliberately absent. It is inlined into the JS bundle at build time
and is not read at runtime — see [docker.md](./docker.md).

Note the password ordering constraint: `POSTGRES_PASSWORD` is read only when the
`postgres_data` volume is first initialised. Changing it later does not change the database
role; you would have to `ALTER USER` or destroy the volume.

## First boot

```bash
cd /opt/fitcoach
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

Startup is ordered by healthcheck: datastores healthy → api healthy → web healthy → caddy.
Caddy requests a certificate on first start; watch it with:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

The database is empty at this point. The app will boot but every query fails until migrations
run.

## Migrations

`sequelize-cli` is a `devDependency`, so it is absent from every runtime image
(see "Known limitations" in [docker.md](./docker.md)). Rather than shipping a separate migration
image, migrations run from a developer working copy through an SSH tunnel.

This is why `postgres` publishes `127.0.0.1:5432:5432` in `docker-compose.prod.yml`. The
loopback form matters: plain `5432:5432` binds `0.0.0.0`, and Docker writes its own iptables
rules that bypass `ufw`, so that would be reachable from the internet regardless of host
firewall rules. Bound to loopback it never touches the external interface, and the DO Cloud
Firewall blocks 5432 as a second layer.

In one terminal:

```bash
ssh -L 5433:127.0.0.1:5432 root@159.89.16.150
```

In another, from the repo root on your machine:

```powershell
$env:DATABASE_URL = "postgresql://postgres:<POSTGRES_PASSWORD>@localhost:5433/starter_kit"
npm run db:migrate --workspace=@starter-kit/api
```

`<POSTGRES_PASSWORD>` is a placeholder — substitute the value, angle brackets included. Left in
place they become part of the password and the only symptom is
`password authentication failed for user "postgres"`, which reads like a mismatched secret.

`Using environment "development"` in the output is expected and harmless: `database.js` reads
`DATABASE_URL` directly, so the environment label selects nothing.

Two things make this work:

- `packages/api/src/config/database.js` calls `dotenv.config()` on the root `.env`, but dotenv
  does not override variables already present in the environment. The shell value wins over the
  `localhost:5432` line in your local `.env`.
- `.sequelizerc` resolves `config`, `migrations-path` and `seeders-path` relative to the current
  working directory. Running via `--workspace` (or from inside `packages/api`) is required;
  from the repo root it resolves to paths that do not exist.

Confirm afterwards:

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U postgres -d starter_kit -c 'select count(*) from "SequelizeMeta";'
```

The tradeoff is that migrations run from a developer machine rather than a reproducible
artifact. Acceptable at this scale. If this grows a CI-driven deploy, build a migration image
from the API Dockerfile's `build` stage instead.

### Seeding: five of eleven seeders, never `db:seed:all`

`npm run db:seed` runs `db:seed:all` and must not be used against production.
`20240101000000-admin-user.js` hardcodes `Admin1234!` for `admin@example.com` in a public
repository, and the admin surface is being removed from the product anyway.

Skipping the admin row rules out three more seeders, because they were written when it was the
only user in the database:

| Seeder | Why it cannot run |
|--------|-------------------|
| `20240703000000-shared-fitness-demo-data` | hardcodes the admin UUID as `user_id`; fails the foreign key |
| `20240705000002-archive-legacy-ai-chat-history` | same UUID, but an `UPDATE`, so it is a silent no-op |
| `20240701000000-seed-program` | `SELECT id FROM users LIMIT 1` throws `No user found` on an empty database |
| `20240705000000-complete-weekly-demo-meals` | builds on the program the seeder above would have created |

Their timestamps place them before the coach seeders, so no ordering fixes this — the coaches do
not exist yet when they run.

The five that are safe on a fresh production database, in this order:

```powershell
$env:SEED_COACH_PASSWORD = "<pick one>"
$env:SEED_CLIENT_PASSWORD = "<pick one>"

npm run db:seed:one --workspace=@starter-kit/api -- 20260806120100-seed-coaches.js
npm run db:seed:one --workspace=@starter-kit/api -- 20260806120200-seed-coach-profiles.js
npm run db:seed:one --workspace=@starter-kit/api -- 20260809120000-seed-coach-requests.js
npm run db:seed:one --workspace=@starter-kit/api -- 20240712000000-seed-program-catalog.js
npm run db:seed:one --workspace=@starter-kit/api -- 20260706061044-dynamic-program-dates.js
```

Same `DATABASE_URL` and tunnel as the migrations above. `SEED_COACH_PASSWORD` and
`SEED_CLIENT_PASSWORD` become the login password for every seeded coach and client respectively;
the seeders refuse to run without them unless `NODE_ENV=development`.

`db:seed:one` exists because `db:seed` is hardwired to `db:seed:all`. The `--seed` flag lives
inside the script rather than being passed on the command line: npm parses a leading `--seed`
as its own config even after `--`, and forwards only the bare filename, which sequelize-cli then
rejects as an unknown argument. Passing the filename as a positional argument avoids that.

`20260706061044-dynamic-program-dates` also does `SELECT id FROM users LIMIT 1` with no
`ORDER BY`, so its personal program attaches to an arbitrary user — in practice a seeded coach.
Skip it if that is confusing in a demo and build the program through the coach UI instead.

## Redeploy

After pushing new images:

```bash
cd /opt/fitcoach
git pull
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker image prune -f
```

`git pull` is only needed when `docker-compose.prod.yml` or `Caddyfile` changed. `docker image
prune -f` matters on a 25 GB disk — superseded `latest` layers otherwise accumulate.

If the release includes new migrations, run them through the tunnel *before* `up -d` when they
are additive, and accept brief downtime when they are not.

## Design notes

### `app.set("trust proxy", 2)`

`packages/api/app.ts` applies `rateLimiter` to `/api/`, and
`packages/api/src/middleware/rate-limiter.ts` caps production traffic at 100 requests per 15
minutes keyed on `req.ip`, with authentication routes at 10.

Behind `caddy → nginx → api` there are two proxy hops, so without `trust proxy` Express reports
the nginx container's address as `req.ip` for every request and all visitors share a single
rate-limit bucket. One SPA page load issues 5–15 API calls, so roughly ten page loads sitewide
would return HTTP 429 to everyone for fifteen minutes.

The value is `2` because Caddy sets `X-Forwarded-For` to the client address and nginx appends
Caddy's via `$proxy_add_x_forwarded_for`. The numeric form is required: `true` triggers
`ERR_ERL_PERMISSIVE_TRUST_PROXY` in express-rate-limit v7, which refuses to trust an unbounded
chain because a client could then forge its own key.

### `/api/docs` and `/api/openapi.yaml` return 404

Swagger UI is mounted unauthenticated in `app.ts`, and publishing it lets anyone enumerate every
route, schema and validation rule.

The rule lives in the `Caddyfile`, not `packages/web/nginx.conf`. Both would work, but the
Caddyfile is bind-mounted, so changing it costs a `docker compose restart caddy` — whereas
nginx.conf is copied into the web image at build time and would need a rebuild and a repush for
every adjustment.

To let reviewers browse the API, delete the `@docs` matcher and restart Caddy.

### HTTP/3 is disabled

The DO Cloud Firewall allows TCP only. Left enabled, Caddy binds UDP 443 inside the container,
succeeds, and advertises an `Alt-Svc` endpoint that no client can reach — costing a failed
handshake before fallback. `protocols h1 h2` in the `Caddyfile` avoids needing a UDP rule.

### Log rotation

`docker-compose.prod.yml` caps every service at 3 × 10 MB via the `x-logging` anchor. The
default `json-file` driver is unbounded, and on a 25 GB disk shared with the Postgres volume an
unattended log can fill the disk until writes start failing.

## Troubleshooting

**Caddy cannot get a certificate.** Check DNS actually resolves to this droplet
(`dig +short fitcoach.ten-ten.live`) and that inbound TCP 80 is open — HTTP-01 needs it. Let's
Encrypt rate-limits failures, so fix the cause before retrying repeatedly.

**Certificate re-issued on every restart.** The `caddy_data` volume is missing or not mounted.

**Login returns 200 but the user stays logged out.** The `secure` cookie flag is being dropped —
the browser reached the site over HTTP, not HTTPS.

**Everyone gets HTTP 429.** The running API image predates `app.set("trust proxy", 2)`.

**Tunnel connects but authentication fails.** `POSTGRES_PASSWORD` in the droplet `.env` differs
from the password baked into the volume at first initialisation.

**A container is killed and restarts.** Check `free -h`; if swap is absent or exhausted, that is
the OOM killer.
