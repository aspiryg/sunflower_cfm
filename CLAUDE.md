# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## What this is

**Sunflower CFM** — a Community Feedback Management platform for the Sunflower
Organization (OPT). Public users submit feedback/complaints; staff classify,
assign, investigate, resolve, and close cases. Full audit trail throughout.

Single deployable: an Express API that also serves the built React SPA in
production.

## Tech stack

- **Backend:** Node.js (ESM, `"type": "module"`), Express 5, `mssql` (Azure SQL /
  MS SQL Server) with **raw SQL** (no ORM), Azure Blob Storage (uploads),
  Nodemailer (email), JWT in HTTP-only cookies.
- **Frontend:** React 19, Vite 7, styled-components, React Router 7, TanStack
  Query, React Hook Form, Recharts, axios. Lives in `frontend/`.
- **Hosting (current):** Azure App Service (Linux, Free F1 plan) + Azure SQL.
  CI/CD via GitHub Actions (`.github/workflows/main_sunflowercfm.yml`) on push to
  `main`.

## Layout

```
server.js                 Express entry point: middleware, routes, SPA serving, boot
backend/
  config/database.js      mssql connection pool + on-boot schema init (DatabaseInitializer)
  config/databaseSchema.js Table creation + seed-data SQL strings
  controllers/            Route handlers
  middlewares/            auth, authorization, upload, validation
  models/                 Raw-SQL data access (Case.js, User.js, Notification.js, ...)
  routes/                 Express routers
  services/               Azure storage, email, permissions
frontend/src/
  pages/                  Route-level pages (LandingPage, Dashboard, PublicFeedbackForm, ...)
  features/               Feature modules (auth, cases, dashboard, notifications, profile, resources, user)
  ui/                     Reusable components incl. Button.jsx, PublicNavbar, layouts
  contexts/               AuthContext, ThemeContext, ToastContext
  styles/GlobalStyles.js  CSS custom properties / design tokens (the theme system)
```

## Commands

Run from repo root unless noted.

```bash
npm install && npm install --prefix frontend   # install both

npm run dev        # backend with nodemon (port 3000)
npm run client     # frontend dev server (Vite, port 5173, proxies /api -> :3000)

npm run build      # installs deps + builds frontend into frontend/dist
npm start          # NODE_ENV=production node server.js (serves API + frontend/dist)
```

Frontend lint: `npm run lint --prefix frontend`. There are **no automated tests**
in this repo (CI runs `npm test --if-present`, which is a no-op).

In production the SPA is only served when `NODE_ENV=production` (see
`server.js` static block). Always verify that app setting on the host.

## Theme system — READ BEFORE TOUCHING COLORS

Colors come from CSS variables in `frontend/src/styles/GlobalStyles.js`. The
palette **inverts between light and dark mode**: e.g. `--color-brand-600` is a
saturated dark indigo (`#4f46e5`) in light mode but a light lavender
(`#c7d2fe`) in dark mode; `--color-brand-50` does the opposite.

**Rule for any colored/filled element with text on top:** pair a *mid/deep* step
with a *light* step and let both invert together — e.g. background
`--color-brand-600` + text `--color-brand-50` (this is exactly what
`ui/Button.jsx` `primary` does). This stays legible in **both** themes.

**Do NOT** hardcode `color: white` on a brand-colored fill, and **do not** use
`--color-brand-50/100/200` as a *background* under light text — those are the
light tints and produce near-invisible buttons in light mode. (This was the bug
on the public/landing pages; `ui/Button.jsx` is the correct reference pattern.)

## Data layer conventions

- Models use the shared pool from `backend/config/database.js` and run **raw
  T-SQL** via `pool.request().input(name, sql.Type, value).query(...)`. Always
  parameterize with `.input()` — never string-concatenate user input.
- The SQL is MS SQL Server dialect: `GETDATE()`, `TOP`, `OFFSET/FETCH NEXT`,
  `OUTPUT INSERTED`, `IDENTITY`, `NVARCHAR`, `MERGE`, bracketed identifiers. Keep
  this in mind for any planned Postgres migration (see below).
- `database.connect()` runs `DatabaseInitializer` on every boot (creates system
  tables, seeds reference data if missing, validates schema). Most table-creation
  steps are currently commented out in `initializeDatabase()`.

## Boot behavior (relevant to cold starts)

`server.js` `startServer()` does `await database.connect()` **before**
`app.listen()`. The HTTP server — including static SPA and `/api/health` — does
not accept connections until the DB connection + on-boot init queries complete.
On a paused/slow DB this serializes the whole cold start. Keep this in mind
before changing startup ordering.

## Conventions

- ESM everywhere (`import`/`export`), 2-space indent, double quotes.
- API responses use `{ success, message, error?, ... }` shape.
- Auth = JWT in HTTP-only cookies; rate limiters defined in `server.js`.
- Secrets live in `.env` (gitignored). Never commit secrets; never echo them.
</content>
