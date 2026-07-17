# Sunflower CFM v2 — Functional Spec (mined from v1)

> Source of truth for the rebuild. Derived from the existing Express + MS SQL
> platform by full-codebase analysis. v2 = **Next.js (App Router) + Drizzle +
> Postgres/pgvector**, containerized on Hetzner, uploads/backups on Backblaze B2.
> New first-class additions: **bilingual AR/EN (RTL)** and **AI classification /
> smart features**. See `ROADMAP.md` for sequencing.

---

## 0. Scope decisions (resolve v1 ambiguities up front)

1. **Carry the "Case" schema, drop the "Feedback" schema.** v1 contains two
   overlapping generations. The live app mounts only the Case schema; the
   Feedback routes/controllers/tables are dead code behind 301 redirects
   (`/api/feedback` → `/api/cases`). v2 implements **Cases only**. Legacy
   Feedback tables/models are reference, not targets.
2. **`caseNumber` format:** v1 has a live inconsistency — code generates
   `CS-YYYYMMDD-0001` while `SystemSettings.case.number.prefix` says `CFM`.
   v2 decision: make the prefix authoritative from settings → `CFM-YYYYMMDD-0001`.
3. **Public feedback intake does not exist in v1.** The public form only
   `console.log`s; `POST /api/cases` is auth-gated. v2 **must add a real
   anonymous intake endpoint** (creates a Case with a system/anonymous submitter,
   channel = Website, minimal required fields). This is net-new.
4. **camelCase identifiers → snake_case columns.** Postgres folds unquoted
   identifiers to lowercase. Drizzle maps JS camelCase ↔ snake_case columns; v2
   uses snake_case in the DB, camelCase in code.
5. **Move client-side aggregation to the server.** v1 dashboards/tables fetch
   `limit: 100000` and reduce in the browser. v2 does real SQL pagination +
   aggregation (and later pgvector-backed search).
6. **One toast system.** v1 ships two (custom ToastContext + react-hot-toast).
   v2 keeps one.

### Known v1 bugs to fix in the rebuild (found during mining)
- `GET /api/auth/status` uses CommonJS `require("jsonwebtoken")` inside an ESM
  file → throws at runtime.
- `authenticateToken` lets an *expired but present* access token fall through to
  a 500 instead of refreshing/401.
- Frontend `ProtectedRoute` uses `hasAnyRole`/`hasExactRole` that
  `useRoleBasedAuth` never returns → `requiredRoles`/`exactRole` props are dead;
  only `requiredRole` works.
- Frontend client-side ownership checks implement only `comments`/`feedback`,
  never `cases` → case ownership silently evaluates false client-side.
- Several controllers fall back to a hardcoded `userId = 1` when `req.user` is
  missing — must be removed (fail closed).
- `ResourceHelpers.getComment/getCategory` return stub objects with
  `createdBy:{id:1}` → ownership checks there aren't real.

---

## 1. Domain data model (target: Postgres + Drizzle + pgvector)

Type mapping: `NVARCHAR(n)`→`varchar(n)`, `NVARCHAR(MAX)`→`text`, `BIT`→`boolean`,
`DATETIME`→`timestamptz`, `DECIMAL(p,s)`→`numeric(p,s)`, `IDENTITY`→`generated
always as identity`, `GETDATE()`→`now()`. CHECK-enum columns → `pgEnum`. JSON/CSV
NVARCHAR blobs → `jsonb` (or real junction tables where it matters).

### Core entities
- **users** — identity (username, email, password hash), profile (name, picture,
  bio, dob, contact block), `role` enum(user|staff|manager|admin|super_admin),
  organization, status flags (isActive, isOnline, lastLogin), email verification
  (token/expires/verifiedAt), security (2FA scaffold, loginAttempts, lockUntil),
  password mgmt (changedAt, reset token/expires), audit block, soft delete.
  Self-referential FKs createdBy/updatedBy/deletedBy → users.
- **cases** — the central transactional table (~90 cols in v1). Groups:
  identity (caseNumber, title, description), classification FKs (category,
  priority, status, channel — all NOT NULL), dates (caseDate, dueDate,
  resolvedDate), impact (urgencyLevel enum, affectedBeneficiaries), program
  context (program/project/activity nullable, ON DELETE SET NULL), provider
  block (providerType + demographics: gender/ageGroup/disabilityStatus enums,
  group size/composition), contact block, consent/privacy (several booleans +
  confidentialityLevel enum public|internal|restricted|confidential), location
  (community FK, location text, coordinates), assignment (assignedTo/By/At,
  comments), submission (submittedBy/At/initials/confirmation), processing
  (firstResponseDate, escalationLevel, escalatedBy/At/reason), resolution
  (summary, category enum, satisfaction enum), metadata (tags, attachments
  jsonb, externalReferences), follow-up/monitoring flags, QA (reviewed/by/at,
  qualityScore numeric(3,2), comments), audit block, soft delete.
  **v2 adds:** an `embedding vector(N)` column (pgvector) for semantic
  search/classification, and `titleAr`/`descriptionAr` or `dir="auto"` handling
  for mixed-direction free text (content stays as-entered; UI renders `dir=auto`).

### Lookup / reference entities (seeded, bilingual — carry `name` + `arabicName`)
- **case_categories** (8 seeded: Service Quality, Access & Availability, Staff
  Conduct, Safety & Security, Discrimination, Positive Feedback, Suggestion,
  Other) — name, arabicName, description(+ar), color, icon, sortOrder.
- **case_statuses** (9 seeded) — drives the lifecycle; flags isInitial, isFinal,
  allowReopen. Values: New(initial) → In Review → Assigned → In Progress →
  Pending Info → Escalated → Resolved(final) → Closed(final,no-reopen);
  Reopened re-entry.
- **case_priorities** (4 seeded: Low/Medium/High/Critical) — `level` (1=highest,
  unique), SLA columns responseTimeHours/resolutionTimeHours/escalationTimeHours.
- **case_channels** (8 seeded), **provider_types** (7 seeded) — name+ar, color,
  icon, sortOrder.

### Hierarchies (self-descending, cascade)
- **Geographic:** regions (3 seeded: West Bank/Gaza/Jerusalem) → governorates →
  communities. Cases point to a community.
- **Programmatic:** programs → projects → activities (projects/activities may be
  standalone). Cases optionally reference program/project/activity.

### Case-owned children (one-to-many, ON DELETE CASCADE)
- **case_history** — insert-only field-level change log (actionType enum,
  fieldName, oldValue/newValue, status/assignment snapshots, ip/userAgent).
- **case_comments** — threaded (self-ref parentCommentId), commentType enum,
  internal/public flags, confidentiality, communication metadata, mentions
  (jsonb), follow-up tracking, edit history, soft delete.
- **case_assignments** — assignment/transfer/escalation history (one row each),
  workload/hours/quality metrics.
- **case_attachments** — file metadata (name, path, size, MIME, category enum,
  confidentiality, storageProvider — **v2 default `b2`**, checksum, virus-scan
  status, thumbnail/preview).

### System entities
- **notifications** — per-user (+ optional case), type enum (9 values), priority
  enum, isRead/readAt, email/push delivery status, metadata jsonb, expiresAt.
- **system_settings** — keyed config (settingKey unique, type enum, category
  enum). 10 seeded (app.name, case.number.prefix=CFM, SLA defaults, session
  timeout, max login attempts, notification toggles).
- **user_sessions** — token/refresh, device/ip, expiry, revoke — (v1 had it
  disabled; v2 decision TBD: rely on stateless JWT or persist sessions for
  revocation. Recommend persisting for the "advanced admin" logout-everywhere.)
- **audit_logs** — global insert-only trail (action enum, entityType/id,
  old/new/fieldChanges jsonb, request metadata, success/error, riskScore).

Every table: `createdAt`/`updatedAt` (+ `createdBy`/`updatedBy` → users on most),
`isActive` boolean; soft-delete triplet (isDeleted/deletedAt/deletedBy) on users,
cases, case_comments, case_attachments.

---

## 2. Authorization model (preserve exactly)

Static RBAC matrix `role → resource → action → restriction`, plus resource-scoped
ownership. Reimplement as a typed module in v2 (single source, shared by server
route handlers and client UI gating — no drift).

- **Roles (numeric hierarchy):** user(1) < staff(2) < manager(3) < admin(4) <
  super_admin(5). `super_admin` bypasses the matrix.
- **Resources:** cases, case_history, case_comments, users, categories,
  case_statuses, notifications, analytics, system (drop feedback*).
- **Actions:** create, read, update, delete, assign, export, import,
  manage_settings, view_analytics, manage_users.
- **Restrictions:** all | own | assigned | none. Ownership fields: cases owner=
  createdBy assignee=assignedTo; notifications owner=userId; users owner=id;
  case_comments/case_history owner=createdBy (+caseId scope).
- **Effective case access:** user→own (createdBy); staff→assigned (assignedTo);
  manager/admin/super_admin→all. Assign/escalate/status gated by
  cases.assign/update. List endpoints scope queries by the same filter (own →
  where createdBy=me; assigned → where assignedTo=me; none → empty).
- **User management:** manager+ can act only on strictly-lower levels, never
  self; assignable roles are strictly below the actor's level; no self role
  change / self delete.

---

## 3. API surface (reimplement as Next.js route handlers)

Preserve semantics and the `{ success, message, error?, data?, pagination? }`
envelope. Static route segments must precede dynamic `[id]` (v1 relied on Express
ordering). Auth = JWT in httpOnly cookies (`accessToken` 1h, `refreshToken` 7d);
access auto-refreshes from refresh token.

**Public:** health; `POST auth/register|login|logout|refresh`,
`GET auth/verify-email/:token`, `POST auth/resend-verification|forgot-password`,
`POST auth/reset-password/:token`; **+ NEW `POST /api/public/feedback`** (anonymous
intake). **Auth (any user):** `auth/me`, `auth/change-password`, all `profile/*`
(self-scoped: profile/contact/username/email/password/2FA/picture/deactivate).
**RBAC:** `users/*` (create admin+, read staff+, update/delete with ownership),
`cases/*` (CRUD + search + `/number/:n` + history + comments + assign/status/
escalate + reference-data CRUD for categories/statuses/priorities/channels/
regions+governorates+communities/provider-types/programs+projects+activities),
`notifications/*` (list/summary/types/read/bulk/delete/case-scoped/create/
email-status/analytics).

Rate limits: general 1000/15m; auth 50/15m; case submission 1000/60m.
Integrations: **B2 (S3 SDK)** for uploads (was Azure Blob); email provider TBD
(was Nodemailer/Gmail — revisit later); Postgres pool via Drizzle.

---

## 4. Frontend (rebuild in Next.js App Router)

- **Public/SEO/i18n-critical:** `/[locale]/(landing, about, submit-feedback)` —
  Server Components, real metadata, first-class AR/EN.
- **Auth pages:** login, register, forgot/reset password, verify-email.
- **App (authenticated, sidebar+header shell):** dashboard, cases (list/add/edit/
  view/assigned-to-me/created-by-me), users (admin+), notifications, my-profile,
  settings (+ resources, + hierarchical resources).
- **Design system:** port the CSS-variable token system + light/dark/system
  theming from `styles/GlobalStyles.js`. Keep the inverting palette rule (see
  root `CLAUDE.md`). Reference component: `ui/Button.jsx` primary
  (`background: brand-600; color: brand-50`).
- **Data:** TanStack Query for client islands; Server Components + server actions
  for reads where it helps SEO/perf; cookie auth forwarded in server fetches.
  Drop deprecated TanStack v4 options.

### RTL / i18n requirements (net-new, first-class)
- Locale-driven `<html lang dir>` (`next-intl` with `/[locale]` segment).
- Replace directional CSS with logical properties (margin/padding/border/inset
  `-inline-*`). v1 hotspots: `AppLayout` margin-left, `Sidebar`
  translateX/border-right, dropdowns `right:0`, toasts slide-from-right,
  directional arrow icons (must flip).
- Add an Arabic webfont (Cairo / Tajawal / IBM Plex Arabic); per-locale
  `--font-sans`. Avoid `text-transform: uppercase` for Arabic.
- Localize dates/numbers via `Intl`; `formatRelativeTime` needs an AR path.
- Lookup entities already carry `arabicName`/`arabicDescription` (server-side);
  free-text case content renders `dir="auto"`.

---

## 5. New capabilities (design later, reserve seams now)

- **AI classification / smart features:** on case create, embed title+description
  (store `embedding vector`), suggest category/priority via nearest-neighbor +
  an LLM (Claude API) classifier; surface suggestions in the intake/edit UI.
  Backend service module + a job queue (Redis) so a slow model call never blocks
  the request. Semantic case search & duplicate detection via pgvector.
- **Command palette, chatbot assistant, advanced admin section** — parked;
  reserve routing/permission seams (system resource, super_admin).
- **Email** — revisit; move off Gmail app password to a transactional provider.
