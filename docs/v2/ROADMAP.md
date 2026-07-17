# Sunflower CFM v2 — Rebuild Roadmap

Ground-up rebuild using v1 as the spec (`SPEC.md`). Target stack: **Next.js
(App Router, consolidated backend) + Drizzle ORM + Postgres 16 + pgvector**,
containerized with `docker compose` on a **Hetzner** VM, **Caddy** for TLS,
**Backblaze B2** for uploads + backups. New first-class features: **bilingual
AR/EN** and **AI classification / smart features**.

**Working agreement:** phased; each phase is independently verifiable and ends
with an explicit sign-off before the next begins. Every phase defines its own
automated verification (there were no tests in v1 — we add them from Phase 1).

**Verification toolchain (introduced Phase 1, used throughout):**
- **Vitest** — unit/integration (schema, data access, RBAC matrix, services).
- **Testcontainers / a disposable `postgres+pgvector` container** — real DB for
  integration tests and migration checks (no mocking the DB).
- **Playwright** — end-to-end for critical flows (auth, case lifecycle, public
  intake, RTL smoke).
- **A spec-parity check** — a script/agent that diffs the built Drizzle schema
  and route inventory against `SPEC.md` and flags gaps.
- Per phase, a verification agent re-derives "does this phase meet its exit
  criteria" independently of the implementer.

---

## Phase 0 — Spec extraction ✅ DONE
Mined v1 into `SPEC.md` (data model, RBAC, API, frontend, RTL gaps, known bugs).

## Phase 1 — Project skeleton + toolchain
Stand up the empty v2 app so every later phase has a home and a test harness.
- Next.js (App Router, JS or TS — **decide: recommend TypeScript** for Drizzle +
  RBAC safety), ESLint/Prettier, `next-intl` wired with `/[locale]` (ar, en).
- Drizzle configured against Postgres; `docker compose` with `web` +
  `postgres (pgvector image)`; `.env.example`; Caddyfile stub.
- Vitest + Playwright + Testcontainers scaffolding; CI workflow (lint + test +
  build). Health route.
- **Exit:** `docker compose up` serves the app; `/en` and `/ar` render (dir
  flips); `npm test` runs green on a trivial test; CI passes.

## Phase 2 — Database schema (Drizzle) + migrations + seed ✅ DONE
Translated the full Case schema to Drizzle (21 tables, 31 pgEnums, 40 FKs,
cascade rules, indexes, soft-delete/audit columns; camelCase↔snake_case; pgvector
extension + `embedding vector(1024)` on cases; Feedback schema dropped).
Seed (admin user, 8 categories, 9 statuses, 4 priorities, 8 channels, 7 provider
types, 3 regions, 10 settings) with Arabic names — idempotent.
- **Verified:** migration applies cleanly to a fresh pgvector container; seed
  loads with exact expected counts and is idempotent on re-run; a 6-test
  integration suite (spec parity for all 21 tables + pgvector/embedding, case
  insert with all FKs + defaults, self-referential threaded comments, soft-delete
  filtering, cascade delete) passes; CI now runs these against a pgvector service.
- Notes for later phases: audit columns (createdBy/updatedBy/deletedBy) are plain
  integers, not FKs to users (v2 decision, see _shared.ts); the ANN index on
  `cases.embedding` is deferred to Phase 6 (needs the chosen op class/model).

## Phase 3 — Data-access + domain services + RBAC ✅ DONE
- **RBAC** as one shared, typed module (`src/lib/rbac`): role hierarchy, the
  role→resource→action→restriction matrix, ownership fields, `authorize`/`can`/
  `queryScope`/`canManageUser`/`assignableRoles`/`hasRole`. Pure — runs on server
  and client so they can't drift.
- **Domain services** (`src/lib/cases`): case-number formatting (settings-
  prefixed `CFM-YYYYMMDD-NNNN`), SLA due-date/response-deadline calc, and status
  transition rules honoring isInitial/isFinal/allowReopen — all pure/tested.
- **Repositories** (`src/db/repositories`): settings, reference data (+ hierarchy
  drill-downs), users (with `toSafeUser`), cases (create with number+SLA+history,
  permission-scoped listing, validated status change, assign, escalate, update,
  soft delete), comments (threaded). Every case mutation writes case_history.
- **Verified:** 20 unit tests (RBAC matrix per role, query scoping, user-mgmt
  hierarchy; case-number/SLA/lifecycle) + 6 repository integration tests against
  the DB (number/SLA/history on create, ownership-scoped list, lifecycle
  enforcement incl. SAME_STATUS/TO_INITIAL/STATUS_LOCKED, assignment history,
  threaded comments, safe-user). 35 tests total green; typecheck/lint/build pass.
- Deferred within later phases: notifications/assignments/attachments repos get
  fleshed out when their API/UI lands (Phase 4/5); audit_logs writer in Phase 4.

## Phase 4 — API (Next route handlers) ✅ DONE (core)
- **Auth infra** (`src/lib/auth`): jose JWT (access+refresh), httpOnly cookies,
  `authenticate()` with DB-fresh user load + transparent access-token refresh,
  bcrypt password service. **Fixes the v1 expired-token 500** and the
  hardcoded-`userId=1` fallbacks (fail closed).
- **HTTP infra** (`src/lib/http`): `{success,…}` envelope, in-memory rate
  limiter (Redis in P7), and `handler`/`authed` guards (error handling + rate
  limit + auth + collection-level RBAC + cookie refresh). Zod validation
  (`src/lib/validation`). Audit writer (`repositories/audit`).
- **Endpoints:** auth (register/login/logout/me/refresh), cases (list scoped,
  create, get/update/delete with instance ownership, status/assign/escalate,
  comments GET/POST, number lookup), users (list/create/get/update/delete +
  role), reference data (one dynamic route: flat lists + hierarchy drill-downs),
  and the **net-new anonymous `POST /api/public/feedback`**.
- **Verified:** 8 API integration tests over the route handlers against the DB —
  register/login/me cookie flow, the **expired-access-token regression** (200 via
  auto-refresh, not 500), RBAC gating (user cannot create users), case ownership
  (user can't read another's case; list excludes it), lifecycle over HTTP
  (200/409), and public intake (public case, null submitter, ref number only).
  43 tests total green; typecheck/lint/build pass.
- **Deferred to a Phase 4 remainder / later phases:** email-dependent flows
  (verify-email, forgot/reset password) — tied to the email decision;
  profile endpoints; notifications endpoints; **B2 storage (S3 SDK)** for
  attachments/profile pictures (needs bucket creds). Tracked in IMPROVEMENTS.

## Phase 5 — Frontend rebuild (bilingual, themed) — ◐ IN PROGRESS
**Part 1 ✅ DONE — foundation + public bilingual vertical:**
- Design-token system (`styles/tokens.css`) with light/dark/system theming and
  the inverting brand palette; `ThemeProvider` (no-FOUC pre-paint script),
  `ThemeToggle`, `LocaleSwitcher`.
- Fonts via `next/font`: Poppins (Latin) + **Cairo (Arabic)**, applied per-dir.
- i18n: `NextIntlClientProvider` now receives messages (client components were
  falling back to keys); expanded EN/AR catalogs.
- Public pages in a `(public)` route group with navbar/footer (logical
  properties → RTL-safe): landing, about, and **submit-feedback wired to the live
  `POST /api/public/feedback`** — the v1 form that only console.logged now works.
- **Verified:** 5 Playwright e2e (landing LTR/RTL, locale switch flips dir,
  **feedback form → live API → CFM reference number**, theme cycle to dark) +
  the prior 4 locale/health e2e = 9 green; 43 vitest still green; build/lint/tc
  pass. Uppercase-label suppression for Arabic; `dir="auto"` on free-text.

**Part 2 — remaining (next):** auth pages (login/register) + AuthProvider/route
guards, the authenticated app shell (sidebar/header, RTL), cases module
(server-paginated list, tabbed form, detail), users/profile/settings — all
gating off the shared `src/lib/rbac`. Then wire TanStack Query for the authed
data layer. (Original Phase 5 detail below.)

### Original Phase 5 plan
Port the UI to App Router with AR/EN + RTL as a first-class concern.
- Design-token system + light/dark/system theming (inverting-palette rule).
- Public pages (SSR + metadata, real AR/EN). Auth pages. App shell (sidebar/
  header with logical properties so RTL works). Cases module (tabbed form,
  detail tabs, list with **server-side** pagination/filter — no more limit
  100000), users, notifications, profile, settings/resources.
- Arabic webfont; `Intl` dates/numbers; single toast system; wire the public
  form to the real endpoint.
- **Verify:** Playwright e2e — auth flow, full case lifecycle, public intake, and
  an RTL smoke run in `/ar` (layout mirrors, no clipped/overflowing elements);
  Lighthouse/SEO check on public pages.

## Phase 6 — AI classification / smart features
- Embedding pipeline on case create/update (store `embedding`); Claude API
  classifier suggesting category/priority; suggestions surfaced in intake/edit.
- Redis-backed job queue so model calls are async; semantic search + duplicate
  detection via pgvector.
- **Verify:** classifier suggestions returned for seeded sample cases;
  nearest-neighbor search returns relevant matches; queue retries on failure;
  graceful degradation when the AI provider is down.

## Phase 7 — Infra, backups, deploy to Hetzner
- Finalize `docker compose`: web, postgres(pgvector), caddy(TLS), redis,
  restic backup → B2 (nightly `pg_dump`, encrypted/incremental), optional
  Uptime Kuma / Watchtower. Secrets via host env / Docker secrets.
- CI/CD: build image → GHCR → SSH deploy (`compose pull && up -d`).
- **Verify:** clean `compose up` on the VM; HTTPS via Caddy; a **restore drill**
  (restic → fresh DB → app boots); health checks green; smoke e2e against the
  live host.

## Phase 8 — Data migration (if v1 prod data must be preserved)
- ETL from Azure SQL → Postgres (map Case-schema rows; ignore Feedback tables);
  backfill embeddings for existing cases.
- **Verify:** row counts + spot-check referential integrity vs source; a sample
  of migrated cases renders correctly in v2.

---

## Open decisions to confirm before/within Phase 1
1. **TypeScript vs JS** for v2 (recommend **TypeScript** — pays off with Drizzle
   + RBAC). 
2. **Repo layout:** new top-level dir in this repo (e.g. `/v2`) vs a fresh repo.
3. **Sessions:** stateless JWT only, or persist `user_sessions` for
   revocation/"log out everywhere" (recommended given the "advanced admin" goal).
4. **Email provider** — deferred by owner; keep a seam.
5. **Preserve v1 production data?** (determines whether Phase 8 runs.)
