// Seeds programmes, pages, documents and the admin user. Idempotent (upserts). Never deletes.
import pg from "pg";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomBytes } from "node:crypto";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const corpus = process.env.CORPUS_DIR || resolve(root, "../../corpus");
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set"); process.exit(1); }

const en = JSON.parse(readFileSync(resolve(root, "src/content/en.json"), "utf8"));
const si = JSON.parse(readFileSync(resolve(root, "src/content/si.json"), "utf8"));
const client = new pg.Client({ connectionString: url });
await client.connect();

// --- users: one admin from env. Token is hashed; the plain token is only ever printed when first created.
const adminEmail = process.env.ADMIN_EMAIL;
const adminToken = process.env.ADMIN_TOKEN;
if (adminEmail && adminToken) {
  const hash = createHash("sha256").update(adminToken).digest("hex");
  await client.query(
    `INSERT INTO users (email, name, role, token_hash) VALUES ($1, $2, 'admin', $3)
     ON CONFLICT (email) DO UPDATE SET token_hash = EXCLUDED.token_hash, role = 'admin'`,
    [adminEmail, process.env.ADMIN_NAME || "NDF admin", hash]);
  console.log(`user   ${adminEmail}`);
} else {
  console.log("user   skipped (ADMIN_EMAIL / ADMIN_TOKEN not set)");
}

// --- programmes (from content pages)
const projects = en.programmes.projects1997;
for (const [i, p] of en.programmes.pages.entries()) {
  const proj = projects.filter(x => x.slug === p.slug);
  const period = proj.map(x => x.period).join("; ") || null;
  const funder = proj.map(x => x.support).join("; ") || null;
  const refs = en.programmeDetail[p.slug]?.refs || (p.slug === "tank-renovation" ? ["NDF-PRG-002", "NDF-PRG-003", "NDF-PRF-001"] : []);
  const r = await client.query(
    `INSERT INTO programmes (slug, sort_order, period, funder, status, source_ids) VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (slug) DO UPDATE SET sort_order=EXCLUDED.sort_order, period=EXCLUDED.period, funder=EXCLUDED.funder, status=EXCLUDED.status, source_ids=EXCLUDED.source_ids
     RETURNING id`, [p.slug, i, period, funder, p.status, refs]);
  const id = r.rows[0].id;
  const sp = si.programmes.pages[i];
  for (const [locale, t, status] of [["en", p, "published"], ["si", sp, "draft"]]) {
    await client.query(
      `INSERT INTO programme_translations (programme_id, locale, title, summary, status) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (programme_id, locale) DO UPDATE SET title=EXCLUDED.title, summary=EXCLUDED.summary, status=EXCLUDED.status`,
      [id, locale, t.title, t.summary, status]);
  }
}
console.log(`programmes ${en.programmes.pages.length}`);

// --- pages (P1 rows of brief section 8)
const pages = [
  ["home", en.meta.siteName, si.meta.siteName],
  ["about/story", en.story.title, si.story.title],
  ["about/approach", en.approach.title, si.approach.title],
  ["about/governance", en.governance.title, si.governance.title],
  ["about/constitution", en.constitution.title, si.constitution.title],
  ["about/legal", en.legal.title, si.legal.title],
  ["about/upali", en.upali.title, si.upali.title],
  ["programmes", en.programmes.title, si.programmes.title],
  ["programmes/tank-renovation", en.tank.title, si.tank.title],
  ["library", en.library.title, si.library.title],
  ["get-involved", en.getInvolved.title, si.getInvolved.title],
  ["records-wanted", en.recordsWanted.title, si.recordsWanted.title],
  ["news", en.news.title, si.news.title],
  ["contact", en.contact.title, si.contact.title],
  ["legal/privacy", en.privacy.title, si.privacy.title],
  ["legal/terms", en.terms.title, si.terms.title],
];
for (const [slug, tEn, tSi] of pages) {
  const meta = slug === "about/legal" ? { legal_status: "under_review", legal_checked: "2026-10-19", legal_document: null } : {};
  const r = await client.query(
    `INSERT INTO pages (slug, phase, published, meta) VALUES ($1,'P1',true,$2)
     ON CONFLICT (slug) DO UPDATE SET updated_at = now(), meta = CASE WHEN pages.meta = '{}'::jsonb THEN EXCLUDED.meta ELSE pages.meta END
     RETURNING id`, [slug, JSON.stringify(meta)]);
  const id = r.rows[0].id;
  for (const [locale, title, status] of [["en", tEn, "published"], ["si", tSi, "draft"]]) {
    await client.query(
      `INSERT INTO page_translations (page_id, locale, title, status) VALUES ($1,$2,$3,$4)
       ON CONFLICT (page_id, locale) DO UPDATE SET title=EXCLUDED.title`, [id, locale, title, status]);
  }
}
console.log(`pages  ${pages.length}`);

// --- documents: public tier only. Rule lives here AND in the DB check constraints.
function readRows(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l.replace(/^﻿/, "")));
}
const manifest = [...readRows(resolve(corpus, "MANIFEST.public.jsonl")), ...readRows(resolve(corpus, "MANIFEST.site.jsonl"))];
const external = {
  "NDF-PRG-002": "https://hdl.handle.net/10568/37945", // CGSpace record, checked 19 October 2026
  "NDF-PRG-003": "https://hdl.handle.net/10568/39134", // CGSpace record, checked 19 October 2026
};
const credits = { "NDF-PRG-002": "International Irrigation Management Institute (IIMI), now IWMI", "NDF-PRG-003": "International Irrigation Management Institute (IIMI) and Agrarian Research and Training Institute (ARTI)" };
const licences = { "NDF-PRG-002": "Copyright IIMI/IWMI. Linked, not hosted.", "NDF-PRG-003": "Copyright IIMI/IWMI. Linked, not hosted." };
const programmeMap = { "NDF-PRG-001": ["biogas"], "NDF-PRG-002": ["tank-renovation"], "NDF-PRG-003": ["tank-renovation", "minipe-water-management", "biogas", "buffalo-bank", "integrated-village", "cottage-dairy"] };
let count = 0;
for (const r of manifest) {
  const ok = r.collection === "ndf_core" && r.sensitivity === "public" && r.ingest === "yes" && r.status === "canonical";
  if (!ok) { console.log(`skip   ${r.doc_id} (not public tier)`); continue; }
  const textFile = r.text_path ? resolve(corpus, r.text_path.startsWith("text/") ? r.text_path : "text/" + r.text_path.split("/").pop()) : null;
  let body = textFile && existsSync(textFile) ? readFileSync(textFile, "utf8") : null;
  if (body && body.startsWith("---")) { const i = body.indexOf("\n---", 3); if (i > 0) body = body.slice(i + 4).trim(); }
  const origName = r.original_path ? r.original_path.split("/").pop() : (r.corpus_path ? r.corpus_path.split("/").pop() : null);
  const hosted = origName && existsSync(resolve(root, "public/documents", origName)) ? `/documents/${origName}` : null;
  const year = r.year ?? (r.date && /^\d{4}/.test(r.date) ? Number(r.date.slice(0, 4)) : (r.date && /c\.(\d{4})/.test(r.date) ? Number(RegExp.$1) : null));
  const dateLabel = r.date ? String(r.date) : null;
  await client.query(
    `INSERT INTO documents (id, collection, sensitivity, status, title, doc_type, language, date_label, year, pages, summary, notes, text_quality, text_source, source_credit, licence, original_url, external_url, programme_slugs, body_text, sha256)
     VALUES ($1,'ndf_core','public','canonical',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, doc_type=EXCLUDED.doc_type, language=EXCLUDED.language, date_label=EXCLUDED.date_label, year=EXCLUDED.year, pages=EXCLUDED.pages, summary=EXCLUDED.summary, notes=EXCLUDED.notes, text_quality=EXCLUDED.text_quality, text_source=EXCLUDED.text_source, source_credit=EXCLUDED.source_credit, licence=EXCLUDED.licence, original_url=EXCLUDED.original_url, external_url=EXCLUDED.external_url, programme_slugs=EXCLUDED.programme_slugs, body_text=EXCLUDED.body_text, sha256=EXCLUDED.sha256, imported_at=now()`,
    [r.doc_id, r.title, r.doc_type, r.language, dateLabel, year, r.pages || null, r.summary || null, r.notes || null, r.text_quality || null, r.text_source || null,
     r.source_credit || credits[r.doc_id] || "National Development Foundation", r.licence || licences[r.doc_id] || "NDF record. Public document.",
     hosted, external[r.doc_id] || null, r.programme_slugs || programmeMap[r.doc_id] || [], body, r.sha256 || null]);
  count++;
}
console.log(`documents ${count}`);

// --- row counts (printed for the smoke test log)
for (const t of ["users", "programmes", "programme_translations", "pages", "page_translations", "documents"]) {
  const c = await client.query(`SELECT count(*)::int AS n FROM ${t}`);
  console.log(`count  ${t} = ${c.rows[0].n}`);
}
await client.query("INSERT INTO audit_log (actor, action, detail) VALUES ('seed', 'seed.run', $1)", [JSON.stringify({ programmes: en.programmes.pages.length, pages: pages.length, documents: count })]);
await client.end();
