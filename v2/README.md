# Sunflower CFM v2

Ground-up rebuild of Sunflower CFM. See the spec and phased plan in
[`../docs/v2/SPEC.md`](../docs/v2/SPEC.md) and
[`../docs/v2/ROADMAP.md`](../docs/v2/ROADMAP.md).

## Stack

- **Next.js 15** (App Router, consolidated backend) + **TypeScript**
- **Drizzle ORM** on **Postgres 16 + pgvector**
- **next-intl** — bilingual **EN / AR** with RTL
- **Backblaze B2** (S3-compatible) for uploads + backups
- Containerized (`docker compose`), **Caddy** TLS, deployed to **Hetzner**
- Tests: **Vitest** (unit/integration) + **Playwright** (e2e)

## Status: Phase 1 — skeleton + toolchain

Working app shell with `/en` and `/ar` (dir flips), a runtime-gated
`/api/health`, Drizzle wired to a pgvector Postgres container, and the test/CI
harness. The domain schema, API, and UI land in later phases.

## Develop

```bash
cp .env.example .env            # fill secrets
npm install
docker compose up -d postgres   # Postgres + pgvector on :5432
npm run db:push                 # apply the Drizzle schema (placeholder in Phase 1)
npm run dev                     # http://localhost:3000 -> /en
```

## Verify

```bash
npm run lint
npm run typecheck
npm test                        # Vitest
npm run test:e2e                # Playwright (builds + starts, then drives /en, /ar, /api/health)
```

## Full stack in containers

```bash
docker compose up --build       # web + postgres
```
