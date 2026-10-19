# Decisions

Dates are when the decision was made. Versions were checked against the npm registry on 19 October 2026.

| Date | Decision | Why |
|---|---|---|
| 2026-10-19 | D1: Next.js full stack, no FastAPI | Low traffic informational site. One container, one language, fewer moving parts. The fastapi-expert skill is not needed for Phase 1. |
| 2026-10-19 | No CMS (Payload spike skipped). Content in `src/content/en.json` and `si.json`; records, programmes, pages and forms in Postgres | Payload 3 adds its own tables and an admin that nobody will staff yet. JSON content is reviewable in GitHub by the team. A CMS can be added in Phase 2 if the team wants to edit in a browser. |
| 2026-10-19 | `pg` with SQL migrations instead of Prisma | Prisma 7.10.1 (latest stable) needs driver adapters and a config file; the 8.0 line is at rc.23. Plain SQL keeps the 13-table count visible and the migrate script asserts it. `pgvector` column is in place for Phase 3. |
| 2026-10-19 | Pinned: next 16.4.2, react 19.3.1, react-dom 19.3.1, typescript 5.9.3, pg 8.23.1, zod 4.6.7, @types/node 22.20.5 | npm `latest` tags on 19 October 2026 (TypeScript 7.0.2 is the new Go-based compiler; 5.9.3 is the last 5.x and is what Next 16 is tested with). Node 22 in the image (Next needs >= 20.9). |
| 2026-10-19 | No Tailwind | The design system ships plain CSS with tokens. Total CSS is 35 KB unminified. Adding Tailwind would add a build step for no gain. |
| 2026-10-19 | Locales en and si only. Tamil deferred | Owner's instruction. The URL structure `/{locale}/` and the DB `locale` columns accept `ta` already. |
| 2026-10-19 | Sinhala copy machine-drafted with Gemini 2.5 Flash (gemini-translate skill), shown with a "draft, not yet reviewed" notice | The brief wants a native review gate. Hiding all Sinhala until review would defeat the owner's bilingual requirement, so the draft is shown and labelled. `page_translations.status = 'draft'` records this. |
| 2026-10-19 | AI-generated illustrations, each captioned "Illustration. Not an archive photograph." | Owner chose this over the brief's real-photos-only rule, with labels. Generated with gemini-3.1-flash-image-preview via the gemini-imagegen skill. Served at 1600 px and 800 px JPEG. |
| 2026-10-19 | Logo: the committee-approved original PNG, from the NDF design system (claude.ai/design project aaa59201). Header uses the symbol with "NDF" in the site font | Design system rule. No vector exists. |
| 2026-10-19 | Fonts self-hosted: Atkinson Hyperlegible Next, Noto Sans Sinhala, Noto Sans Tamil, variable files subset by script from Google Fonts, SIL OFL 1.1 | Design system rule: no runtime calls to Google Fonts. |
| 2026-10-19 | Scans and texts carrying the Maharagama home address (NDF-FND-003 scan, NDF-PRF-001 PDF, NDF-CON-002 PDF) are held, not hosted. Hosted texts have the address line withheld | Brief section 7. Family consent for the address was not given. |
| 2026-10-19 | Four review documents added to the public tier with new IDs: NDF-PRF-001, NDF-ACT-001, NDF-CON-001, NDF-CON-002 | They are NDF's own records, supplied by the owner as drafts for review. |
| 2026-10-19 | Programmes seeded: 12 (not the brief's 6) | The 1997 booklet and the activities list add programmes beyond the six of 1990. Smoke test expects 12. |
| 2026-10-19 | Officer names published: 1997 booklet names (Upali Magedaragamage, Roy Anthony, V.N.S. Iranganie) as past office-holders; Upali as Executive Secretary in 2022. No current officers | Owner approved the 1997 names and the tribute page (facts only). Piyasiri Bulumulla (2022 Chairman, restricted source) is not named. |
| 2026-10-19 | Legal standing box defaults to "under review"; the renderer refuses "confirmed" without `legal_checked` and `legal_document` in `pages.meta` | Brief section 8.1. |
| 2026-10-19 | Email: raw SMTP to a host-provided relay (Mailhog in dev). No provider chosen yet | Brief says choose a provider in Phase 1 after a search; forms are stored in Postgres regardless, so nothing is lost if mail fails. |
| 2026-10-19 | Rate limiting in process memory | One container. Move to Postgres if scaled out. |
| 2026-10-19 | External links for IIMI papers: CGSpace handles 10568/37945 and 10568/39134 (checked 19 October 2026). PDFs not hosted | Copyright, brief section 7. |
| 2026-10-19 | Production: Docker Compose on srv1033016, web bound to 127.0.0.1:3080, Traefik file-provider route in `deploy/traefik-ndflk.yml` | Matches the host's existing Traefik setup (file provider). |

Not verified here: Lighthouse scores on a throttled mobile profile (run on the live site); native review of Sinhala; the exact licence of the IIMI papers (linked, not hosted, so no exposure).
