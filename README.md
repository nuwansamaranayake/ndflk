# ndflk.org

Public website of the revival of the National Development Foundation (NDF), Sri Lanka. English and Sinhala.

Stack: Next.js 16 (App Router), React 19, TypeScript, plain CSS from the NDF design system, PostgreSQL 17 with pgvector, Docker. No CMS: content lives in `apps/web/src/content/{en,si}.json`; documents, programmes, pages and form submissions live in Postgres.

## Layout
```
apps/web/            Next.js app (pages, API routes, scripts/migrate.mjs, scripts/seed.mjs)
corpus/              Public tier of the NDF corpus: MANIFEST.public.jsonl, MANIFEST.site.jsonl, text/, originals/
db/migrations/       SQL migrations (0001_init.sql creates the 13 tables + schema_migrations)
deploy/              Production compose file, Traefik route, deploy.sh for the VPS
scripts/             smoke.mjs (checks), smoke.ps1 (Windows wrapper), deploy.ps1
docs/                API_CONTRACT.md, DECISIONS.md, RUNBOOK.md
```

## Local (Windows PowerShell, Docker Desktop)
```powershell
cd apps\web; npm ci; npm run build; cd ..\..
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
docker compose exec -T web node scripts/migrate.mjs
docker compose exec -T web node scripts/seed.mjs
$env:NDF_ADMIN_TOKEN = "dev_admin_token_change_me"; .\scripts\smoke.ps1
```
Open http://localhost:3000 (redirects to /en or /si). Mailhog: http://localhost:8025.

## Rules that live in code
- Only `collection = ndf_core`, `sensitivity = public`, `status = canonical` rows are seeded; the `documents` table has check constraints for this.
- Scans or texts that carry a private home address are held in `corpus/held/` (git-ignored) and never served. The smoke test probes for the address.
- The legal standing box never renders "Confirmed" without a recorded date and document ID.
- No mock data. If the database is down, pages and APIs return an error state.
- Sinhala is machine-drafted (Gemini) and marked as a draft pending native review.
