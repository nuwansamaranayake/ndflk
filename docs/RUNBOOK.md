# Runbook

## Deploy
From Windows: `.\scripts\deploy.ps1`. It runs `deploy/deploy.sh` on the VPS over SSH (key in `%USERPROFILE%\.aignite-secrets\ndflk-deploy\`), which pulls main, builds the image, starts Postgres and web, migrates, seeds, asserts 14 tables and runs the smoke test inside the container. Then it runs the public smoke test against https://ndflk.org.

First time on the VPS:
1. `git clone https://github.com/nuwansamaranayake/ndflk /opt/ndflk`
2. Create `/opt/ndflk/deploy/.env` from `.env.example` (POSTGRES_PASSWORD, ADMIN_EMAIL, ADMIN_TOKEN, NOTIFY_TO, SMTP_HOST).
3. Copy `deploy/traefik-ndflk.yml` into Traefik's dynamic config folder.
4. Run `bash deploy/deploy.sh`.

## Smoke test
`.\scripts\smoke.ps1` (local) or `.\scripts\smoke.ps1 -Base https://ndflk.org -Production`. 36 checks: health with DB, programmes (12), documents (>= 6, registration records present), full-text search, restricted IDs return 404, no private address in any text, admin token accepted and missing token rejected, form round trips, pages render in both languages, root redirect, fonts and public PDFs served, held scan not served, table count 14.

## Content changes
Edit `apps/web/src/content/en.json` (and `si.json`). Document metadata lives in `corpus/MANIFEST.site.jsonl` and texts in `corpus/text/`. Re-run `node scripts/seed.mjs` after changing documents or programme cards. Seed is idempotent and never deletes.

## Legal standing state
`UPDATE pages SET meta = '{"legal_status":"confirmed","legal_checked":"YYYY-MM-DD","legal_document":"NDF-FND-004"}' WHERE slug='about/legal';` The page refuses to show Confirmed without both the date and the document ID.

## Messages
`curl -H "Authorization: Bearer $ADMIN_TOKEN" https://ndflk.org/api/admin/messages` lists form submissions. Uploaded files are quarantined in the `ndflk_uploads` volume (`/data/uploads`) and are never served.

## Backup
`docker exec ndflk-db pg_dump -U ndf ndf | gzip > ndflk-$(date +%F).sql.gz` on the VPS. Restore with `gunzip -c file | docker exec -i ndflk-db psql -U ndf ndf`.
