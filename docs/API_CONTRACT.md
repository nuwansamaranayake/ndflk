# API contract

Every URL the frontend calls, mapped to its route handler. `scripts/check-contract.mjs` fails the build if a frontend call has no route. Phase 1 only.

| Frontend call (file) | Method and path | Handler | Auth | Returns |
|---|---|---|---|---|
| health checks, Docker HEALTHCHECK, smoke | GET /api/health | apps/web/src/app/api/health/route.ts | none | `{status, db, version, time}`; 503 when the DB is down |
| smoke, external clients | GET /api/programmes?locale= | api/programmes/route.ts | none | `{items[], total, locale}` (12 items) |
| smoke, external clients | GET /api/programmes/{slug}?locale= | api/programmes/[slug]/route.ts | none | programme object or 404 |
| library page (server-side), smoke | GET /api/documents?type=&lang=&year=&programme=&q= | api/documents/route.ts | none | `{items[], total}` public tier only |
| library item (server-side), smoke | GET /api/documents/{docId} | api/documents/[docId]/route.ts | none | metadata and `text`, 404 for restricted or unknown IDs |
| Forms.tsx NewsletterForm | POST /api/newsletter | api/newsletter/route.ts | none, rate limited 5/10 min per IP | 202, 400, 429, 503 |
| confirm link in email | GET /api/newsletter/confirm?token= | api/newsletter/confirm/route.ts | token | 200 HTML, 400, 404 |
| Forms.tsx MessageForm (contact, get-involved, upali) | POST /api/contact (multipart or JSON) | api/contact/route.ts | none, rate limited 8/10 min per IP | 202, 400, 429, 503 |
| Forms.tsx MessageForm (records-wanted, file upload) | POST /api/records-offer (multipart) | api/records-offer/route.ts | none, rate limited | 202, 400, 413, 415, 429, 503 |
| admin tooling, smoke | GET /api/admin/messages?limit= | api/admin/messages/route.ts | Bearer admin token (sha256 compared to users.token_hash) | `{items[], counts[]}`; 401 without token |
| crawlers | GET /sitemap.xml | app/sitemap.ts | none | XML with hreflang alternates |

Pages that read the database directly (no HTTP hop): `/[locale]/library`, `/[locale]/library/[id]`, `/[locale]/about/legal`. They render an error state if the query fails. All other pages render from `src/content/*.json`.

Phase 2 and 3 routes (`/api/donations`, `/api/payhere/notify`, `/api/admin/donations`, `/api/ask`) are not built. Their tables exist.
