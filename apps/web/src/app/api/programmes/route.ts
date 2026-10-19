import { query } from "@/lib/db";
import { isLocale } from "@/lib/i18n";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const url = new URL(req.url); const locale = isLocale(url.searchParams.get("locale") || "") ? url.searchParams.get("locale") : "en";
  try {
    const items = await query(
      `SELECT p.slug, p.period, p.funder, p.status, p.source_ids, t.title, t.summary, t.locale, t.status AS translation_status
       FROM programmes p JOIN programme_translations t ON t.programme_id = p.id AND t.locale = $1 ORDER BY p.sort_order`, [locale]);
    return Response.json({ items, total: items.length, locale });
  } catch (e) { console.error("programmes:", (e as Error).message); return Response.json({ error: "database unavailable" }, { status: 503 }); }
}
