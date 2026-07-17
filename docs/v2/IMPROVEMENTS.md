# Sunflower CFM v2 — Improvements & Deficiency Backlog

Running log of everything found in v1 that needs **fixing**, **updating**, or
**adding** so v2 ships as a more advanced, deficiency-free version. Appended to
continuously as each phase uncovers more. Grouped by area; each item tagged
`[fix]` (bug/defect), `[update]` (modernize/harden), or `[add]` (new capability).

> Status legend: ☐ open · ◐ in progress · ☑ done in v2

---

## Auth & security
- ☐ `[fix]` `GET /api/auth/status` uses CommonJS `require("jsonwebtoken")` inside
  an ESM module → throws at runtime.
- ☑ `[fix]` `authenticateToken` lets an *expired-but-present* access token fall
  through to a 500 instead of refreshing or returning 401. _Phase 4: session
  layer distinguishes expired vs invalid and auto-refreshes; regression-tested._
- ☑ `[fix]` Controllers fall back to a hardcoded `userId = 1` when `req.user` is
  missing — must fail closed, never impersonate the admin. _Phase 4: `authed`
  guard returns 401 when unauthenticated; no fallback actor exists._
- ☐ `[fix]` `ResourceHelpers.getComment`/`getCategory` return stub objects with
  `createdBy:{id:1}` → ownership checks there are not real.
- ☐ `[update]` JWT secrets/rotation: v1 shipped placeholder `JWT_SECRET`. v2
  requires strong secrets, documented rotation, refresh-token revocation.
- ☐ `[add]` 2FA is scaffolded in v1 (fields exist) but never wired. Decide:
  implement TOTP 2FA or remove the dead surface.
- ☐ `[add]` Session persistence for "log out everywhere" / device management
  (v1 `UserSessions` table exists but is disabled). Ties to advanced admin.
- ☐ `[update]` `requireEmailVerification` middleware exists but is never applied;
  decide where verification is actually enforced.
- ☐ `[add]` Account lockout / brute-force protections exist but should be
  reviewed and surfaced in the admin UI.

## Authorization / RBAC
- ☐ `[fix]` Frontend `ProtectedRoute` calls `hasAnyRole`/`hasExactRole` that the
  hook never returns → `requiredRoles`/`exactRole` props are dead; only
  `requiredRole` works.
- ◐ `[fix]` Frontend client-side ownership checks implement only
  `comments`/`feedback`, never `cases` → case ownership silently evaluates false.
  _Phase 5 part 2: UI gates off the same `src/lib/rbac` as the server (e.g.
  Users nav hidden for non-admins); full per-instance UI ownership lands with the
  case detail view in part 3._
- ☑ `[update]` Backend and frontend maintain **separate** permission matrices
  that can drift. v2: one shared, typed source of truth. _Phase 3: single
  `src/lib/rbac` module (pure, isomorphic); frontend will import the same in P5._
- ☐ `[add]` No team/organization scoping — `organization` rides in the JWT but
  case ownership keys only on user id. Consider org/team-scoped access.

## Cases / domain
- ☑ `[fix]` `caseNumber` inconsistency: code generates `CS-YYYYMMDD-0001` while
  `SystemSettings.case.number.prefix` says `CFM`. v2: settings-authoritative.
  _Phase 3: `getCasePrefix()` + `formatCaseNumber()` produce `CFM-YYYYMMDD-NNNN`,
  with a unique-collision retry; tested._
- ☑ `[add]` **Public anonymous feedback intake does not exist.** The public form
  only `console.log`s; `POST /api/cases` is auth-gated. v2 adds a real endpoint.
  _Phase 4: `POST /api/public/feedback` creates a public case (null submitter,
  rate-limited, audit-logged); returns only a reference number. Tested._
- ◐ `[update]` Denormalized JSON/CSV blobs (`mentionedUsers`, `accessControl`,
  `tags`, `attachments`, `groupProviderGenderComposition`) → proper `jsonb` or
  junction tables. _Phase 2: `attachments`/`accessControl`/`mentionedUsers`/
  metadata are now `jsonb`; `tags` kept as text pending a tags junction decision._
- ☑ `[add]` Case lifecycle (New→…→Closed, Reopened) is data-driven but not
  enforced — add explicit transition validation (honor isInitial/isFinal/
  allowReopen) so illegal jumps are rejected. _Phase 3: `canTransition()` +
  enforced in `changeCaseStatus`; tested._
- ◐ `[add]` SLA due-date calc from priority hours exists ad hoc; make it a
  first-class, tested service with escalation reminders. _Phase 3: due-date +
  response-deadline are pure tested services applied on create; escalation
  reminders (scheduled job) still to add._

## Performance / data access
- ◐ `[fix]` Dashboards & tables fetch `limit: 100000` and filter/sort/paginate
  **in the browser**. v2: real server-side SQL pagination + aggregation.
  _Phase 5 part 2: cases list uses real server-side pagination (page/limit +
  totalPages/hasNext). Aggregate dashboard stats still to expand._
- ☑ `[update]` `useCaseStats` computes stats client-side by reducing all cases →
  move to SQL aggregate endpoints. _Phase 5 part 3: `GET /api/cases/stats` does a
  SQL `count(*) filter(...)` aggregate (total/open/resolved), permission-scoped._
- ☐ `[update]` No DB-level full-text/semantic search in v1 → add Postgres FTS +
  pgvector semantic search.

## Frontend / UX
- ◐ `[add]` **Bilingual AR/EN + full RTL** — none exists in v1 (see SPEC §4 RTL
  list: layout uses physical `margin-left`/`border-right`, dropdowns `right:0`,
  toasts slide-from-right, directional icons don't flip, no Arabic webfont,
  English-only relative dates). _Phase 5 part 1: locale-driven `<html dir>`,
  Cairo Arabic webfont, tokens/layout use logical properties, uppercase
  suppressed for AR, `dir="auto"` on free text, locale switcher. Public pages
  done; authed app shell RTL in part 2._
- ☐ `[fix]` Two toast systems coexist (custom ContextToast + react-hot-toast) —
  consolidate to one.
- ☐ `[update]` Several hooks use deprecated TanStack Query v4 options
  (`onError`/`onSuccess`/`keepPreviousData`/`cacheTime`) on v5 → clean up.
- ☐ `[update]` v1 ships a single ~1.5 MB JS bundle (noted earlier) → route-level
  code splitting (native in App Router).
- ☐ `[add]` Advanced command palette (⌘K) — requested.
- ☐ `[add]` Chatbot assistant — requested.
- ☐ `[add]` Very advanced admin section — requested (users, roles, settings,
  audit log viewer, sessions, system health).
- ☐ `[update]` `text-transform: uppercase` on labels is meaningless for Arabic —
  gate per-locale.

## AI / smart features `[add]`
- ☐ Auto-classification of category/priority on intake (Claude API + pgvector).
- ☐ Semantic case search + duplicate detection.
- ☐ Smart suggestions in the case form; summarization of long case threads.
- ☐ (Landing page already advertises "Smart Classification AI" — currently
  vaporware; v2 makes it real.)

## Notifications
- ☐ `[update]` "Real-time" is refetch-on-focus/reconnect only (no push/SSE/WS).
  Consider SSE or WebSocket for true real-time.
- ☐ `[fix]` `getNotificationAnalytics` returns stubbed zeros → implement.
- ☐ `[add]` Push/email delivery status is tracked in schema but delivery is
  partial — finish the notification delivery pipeline.

## Files / storage
- ☐ `[update]` Migrate uploads Azure Blob → Backblaze B2 (S3 SDK).
- ☐ `[add]` Virus-scan status is modeled (`virusScanStatus`) but not performed →
  wire an actual scan step or drop the pretense.
- ☐ `[add]` `documentUpload` middleware exists but no route uses it → real case
  attachment upload endpoints.

## Email `[update]` (deferred by owner)
- ☐ Move off Gmail app password (rate limits, deliverability, spam) to a
  transactional provider (Resend/Postmark/SES).

## Infra / ops
- ☐ `[fix]` v1 cold start on Azure F1 (no Always On). v2: Hetzner container that
  stays warm.
- ☐ `[add]` Automated backups (restic → B2) with a tested restore drill.
- ☐ `[add]` Health/uptime monitoring + alerting (Uptime Kuma or similar).
- ☐ `[update]` v1 GitHub Actions use deprecated Node20 action versions.

## Dead code to NOT carry forward
- ☑ Entire "Feedback" schema/routes/controllers (superseded by "Cases", behind
  301 redirects in v1). _Phase 2: not carried into the v2 Drizzle schema._
- ☐ Unmounted/unused: `documentUpload` (until re-wired), `requireRole`,
  `applyResourceFilter`, orphan pages (`Feedback*`, `FeaturesPage`).
