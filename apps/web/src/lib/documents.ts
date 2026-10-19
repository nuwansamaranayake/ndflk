import "server-only";
import { query } from "./db";

export type DocRow = {
  id: string; title: string; doc_type: string; language: string; date_label: string | null; year: number | null; pages: number | null;
  summary: string | null; notes: string | null; text_quality: string | null; text_source: string | null; source_credit: string | null; licence: string | null;
  original_url: string | null; external_url: string | null; programme_slugs: string[]; body_text?: string | null;
};
export type DocFilter = { type?: string; lang?: string; year?: string; programme?: string; q?: string };

// The public tier rule lives here and in the table's check constraints: only ndf_core, public, canonical rows exist in `documents`.
const PUBLIC = "collection = 'ndf_core' AND sensitivity = 'public' AND status = 'canonical'";

export async function listDocuments(f: DocFilter = {}): Promise<{ items: DocRow[]; total: number }> {
  const where = [PUBLIC]; const params: unknown[] = [];
  if (f.type) { params.push(f.type); where.push(`doc_type = $${params.length}`); }
  if (f.lang) { params.push(f.lang); where.push(`language = $${params.length}`); }
  if (f.year) { params.push(Number(f.year)); where.push(`year = $${params.length}`); }
  if (f.programme) { params.push(f.programme); where.push(`$${params.length} = ANY(programme_slugs)`); }
  if (f.q && f.q.trim()) { params.push(f.q.trim()); where.push(`(tsv @@ plainto_tsquery('simple', $${params.length}) OR title ILIKE '%' || $${params.length} || '%' OR id ILIKE '%' || $${params.length} || '%')`); }
  const sql = `SELECT id, title, doc_type, language, date_label, year, pages, summary, notes, text_quality, text_source, source_credit, licence, original_url, external_url, programme_slugs
               FROM documents WHERE ${where.join(" AND ")} ORDER BY year NULLS LAST, id`;
  const items = await query<DocRow>(sql, params);
  return { items, total: items.length };
}

export async function getDocument(id: string): Promise<DocRow | null> {
  const rows = await query<DocRow>(`SELECT id, title, doc_type, language, date_label, year, pages, summary, notes, text_quality, text_source, source_credit, licence, original_url, external_url, programme_slugs, body_text FROM documents WHERE ${PUBLIC} AND id = $1`, [id]);
  return rows[0] ?? null;
}

export async function documentFacets(): Promise<{ types: string[]; langs: string[]; years: number[] }> {
  const t = await query<{ v: string }>(`SELECT DISTINCT doc_type AS v FROM documents WHERE ${PUBLIC} ORDER BY 1`);
  const l = await query<{ v: string }>(`SELECT DISTINCT language AS v FROM documents WHERE ${PUBLIC} ORDER BY 1`);
  const y = await query<{ v: number }>(`SELECT DISTINCT year AS v FROM documents WHERE ${PUBLIC} AND year IS NOT NULL ORDER BY 1`);
  return { types: t.map((x) => x.v), langs: l.map((x) => x.v), years: y.map((x) => x.v) };
}
