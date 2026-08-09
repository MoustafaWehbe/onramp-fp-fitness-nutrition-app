# Coach side — implementation plan

Scope owner: Youssef. Covers the coach half of the pivoted product (coach + client roles,
no admin dashboard).

## Product flow

1. Client browses coaches — sees photo, name, gender, age, years of experience, rating.
2. Client sends a request to one coach, optionally declaring health problems.
3. Coach sees the request on their dashboard and accepts or declines.
4. Coach builds one program for that client: a weekly meal plan and a workout schedule.
5. Client follows the plan, then rates the coach. The rating feeds back into step 1.

A program is built **once** per client — not regenerated weekly, not versioned.
A coach has **no cap** on active clients.

## Branch breakdown

| # | Branch | State |
|---|--------|-------|
| 0 | `feature/coach-foundation` | merged (PR #23) — the coach domain: schema, models, API |
| 1 | `feature/coach-program-builder` | current — builder, plus branch 2 and most of branch 3 |
| 2 | `feature/coach-requests` | absorbed into branch 1 |
| 3 | `feature/coach-profile-ratings` | profile editing shipped in branch 1; ratings still outstanding |
| 4 | `chore/remove-admin` | deliberately last |

Branches 2 and 3 were pulled forward into branch 1 rather than split out. The
builder needs an accepted request to build against, and nothing in the UI could
accept one — the flow was only reachable by calling the API by hand. Splitting
that across three PRs would have meant two of them being individually
undemonstrable.

### Why branch 0 exists

PR #22 (`feature/coach-profiles`, a teammate's) carried the coach domain, and CodeRabbit
flagged it heavily. The teammate's position was that those files are coach-side and
therefore ours, so we took them over and rebuilt them here rather than merging the PR.

The two branches could not simply coexist: both migrations ran
`addColumn("programs", "coach_id")`, so whichever applied second would fail. This branch
replaces both with a single `20260806120000-add-coach-domain.js`.

What was kept deliberately compatible with their branch, so their client-side work still
runs unchanged: the route mounts (`/coaches`, `/coach-profile`, `/coach-requests`), the
`CoachRequestStatus` values (`rejected`, not `declined` — their `RequestCoach.tsx` branches
on it), and the response envelope.

### Review findings addressed

Ten of the fourteen CodeRabbit findings on PR #22 were coach-side and are fixed here.
The remaining four are client-side and stay with the teammate: the `Gender` enum callers
(`Onboarding.tsx` still offers "other", which this schema rejects), `ApiCoach.email`,
measurement validation, and the profile-load guard on `RequestCoach.tsx`.

Two problems the review did not catch, also fixed: both seeders imported `bcrypt` and
`uuid`, neither of which is a dependency of this repo (`bcryptjs` is, and the house
seeders use fixed ids); and the existing program seeders needed an explicit
`status: "published"`, or the whole catalog would be seeded as coach drafts.

## Branch 0 — coach foundation

### Database

One migration, `20260806120000-add-coach-domain.js`:

- `coach` added to the `users.role` enum (`ADD VALUE IF NOT EXISTS`, idempotent).
- `user_profiles`, `coach_profiles`, `coach_requests` created.
- `programs.coach_id` (author), `programs.coach_request_id` (the accepted request that
  produced it), `programs.status` (`draft` | `published`). Existing rows are backfilled
  to `published` so nothing already visible disappears.
- A partial unique index, `coach_requests_user_id_pending_unique` on `(user_id) WHERE
  status = 'pending'`. The service cannot hold "one pending request per client" with a
  read-then-insert: two concurrent calls both see no pending row. The database holds it
  and the service maps the violation to a 409.

`coach_profiles` carries `gender` and `birth_date`, which the teammate's table lacked
entirely — the discovery listing is specified to show gender and age, so without them the
table could not back the screen it exists for. `birth_date` rather than an `age` integer,
because a stored age goes stale.

`gender` is `male | female` in both profile tables and in the `Gender` union. The review
flagged the two disagreeing; they are aligned to two values.

`day_plans` is deliberately left alone. Making its `date` nullable was considered and
rejected: the client plan view keys off real dates — `MyPlan` highlights today by string
comparison and `Dashboard` joins daily logs on `log.date === dayPlan.date` — so dateless
days would break the client's plan rendering. Instead a coach program carries a
`start_date` (coach-chosen, defaulting to the next Monday) and day N derives its date
from it.

### API

Role gating uses the existing `middleware/authorize.ts`. The teammate's `requireRole.ts`
is dropped rather than fixed — it duplicated `authorize` and imported `UserRole` from a
path that does not exist.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/coaches` | Discovery listing. No email addresses — it is open to any authenticated client |
| `GET` | `/coach-profile` | The signed-in coach's own profile |
| `PATCH` | `/coach-profile` | Upsert, through an allowlist schema so `rating` and `clientsCount` cannot be self-set. `PATCH` because every field is optional and omitted fields are left alone |
| `POST` | `/coach-requests` | Client sends a request |
| `GET` | `/coach-requests/mine` | Client's latest request |
| `GET` | `/coach-requests/pending` | Requests addressed to this coach only |
| `PATCH` | `/coach-requests/:id/accept` | Accept |
| `PATCH` | `/coach-requests/:id/decline` | Decline — the scope requires it; their branch had accept only |

Both transitions go through `findOwnPending`, so a coach can never reach a request that
was not addressed to them, and neither path can drift from the other.

## Branch 1 — program builder

What already exists on `main` and is reused as-is: `Program`, `DayPlan`, `Meal`, `MealItem`,
`Workout`, `Exercise`, with associations `Program → DayPlan → (Meal → MealItem, Workout →
Exercise)`. That shape already matches "weekly meal plan + workout schedule" — no new
plan tables are needed.

### API

- `services/coachProgram.service.ts`
- `controllers/coachProgram.controller.ts`
- `routes/coachProgram.routes.ts`, mounted at `/coach/programs`
- `schemas/coachProgram.schema.ts`

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/coach/programs` | Create a draft program from an accepted request |
| `GET` | `/coach/programs` | List programs this coach authored |
| `GET` | `/coach/programs/:programId` | Full program: 7 days, meals + items, workout + exercises |
| `PATCH` | `/coach/programs/:programId` | Update program meta (title, goal, calories, macros) |
| `PUT` | `/coach/programs/:programId/days/:dayNumber` | Upsert one day — meals and workout together |
| `POST` | `/coach/programs/:programId/publish` | Flip draft to published |
| `GET` | `/coach-requests/accepted` | Accepted clients, with their profile and program if built |

`POST` takes a `coachRequestId`, not a client id: the client is derived from the
accepted request, and `programs.coach_request_id` is unique, so "one program per
accepted request" is held by the database rather than by a check. `PATCH` rather
than the `PUT` originally planned, for the same reason as `/coach-profile` —
every field is optional.

A program is one dated week. Creating the draft also creates its seven
`day_plans`, dated from a coach-chosen `startDate` that defaults to the coming
Monday. Real dates are not optional: `MyPlan` highlights today by comparing
dates, and the logging tables (`meal_logs`, `workout_logs`) hang off
`day_plan_id`, so a dateless plan cannot be logged against.

Day upsert replaces that day's meals and workout wholesale, and is refused once
the program is published. `meal_logs` and `workout_logs` cascade from `meals` and
`workouts`, so re-saving a published day would delete what the client had already
logged. Publishing is therefore one-way, and it checks that every non-rest day
has a workout with at least one exercise and that the program has at least one
meal.

Every endpoint checks `program.coachId === req.user.userId` before reading or writing.
A coach must never reach another coach's program — this is the same class of bug already
flagged on the teammate's branch, so it gets a test rather than a comment.

Day-level upsert (rather than one save-everything call) keeps request bodies small and
makes a partially built program a valid state.

### Web

- `routes/CoachRoute.tsx` — role guard, mirrors the existing `AdminRoute`.
- `constants/routes.ts` — add `coachPrograms`, `coachProgramBuilder(id)`.
- `pages/coach/ProgramBuilder.tsx` — day tabs (1–7) with two sections per day:
  - **Meals** — breakfast / snack / lunch / dinner, each with items (name, quantity,
    calories, protein, carbs, fat). Meal totals derive from items rather than being typed.
  - **Workout** — one workout per day, or mark the day as rest. Exercises carry name,
    sets, reps, rest, muscle, notes.
- `pages/coach/CoachPrograms.tsx` — list of authored programs, entry point to the builder.
- `hooks/useCoachProgram.ts` — fetch and per-day save.

### Role separation

The sidebar was one hardcoded client nav shown to everyone, so a coach was invited to
request a coach of their own. Nav is now role-based, and `ClientRoute` / `CoachRoute`
guard the routes themselves — hiding a link does not stop anyone typing the URL. This
also fixes where a coach lands after signing in: `Login` sends everyone to `/dashboard`,
which now redirects a coach on to their own pages.

Accepting a request deliberately does **not** create a program. The coach chooses the
title, goal, calorie target and start date, so there is nothing sensible to create until
they have.

## Branch 2 — requests page (shipped in branch 1)

- Pending requests addressed to the signed-in coach, accept and decline on each.
- The client's goal, age, measurements, activity level, and their declared injuries and
  dietary notes on the card — the health information the request exists to convey.
- Accepted clients listed below, linking to their program or into the builder with that
  client preselected.

## Branch 3 — ratings

Profile fields shipped in branch 0, and the editing screen in branch 1 (in Settings,
coach-only). What is left:

- `coach_ratings` table — one rating per client per coach, written after the plan is
  delivered.
- Replace the seeded static `rating` with the aggregate, on the listing and on the
  coach's own dashboard.

## Branch 4 — remove admin

Left until last so it does not conflict with anything above.

- Remove admin pages, `AdminRoute`, admin controller, service and routes.
- Remove `admin` from the role enum and migrate any existing admin rows.
