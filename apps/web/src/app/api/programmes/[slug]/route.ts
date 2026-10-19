import { query } from "@/lib/db";
import { isLocale } from "@/lib/i18n";
export const dynamic = "force-dynamic";
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(req.url); const locale = isLocale(url.searchParams.get("locale") || "") ? url.searchParams.get("locale") : "en";
  try {
    const rows = await query(`SELECT p.slug, p.period, p.funder, p.status, p.source_ids, t.title, t.summary, t.locale FROM programmes p JOIN programme_translations t ON t.programme_id = p.id AND t.locale = $2 WHERE p.slug = $1`, [slug, locale]);
    if (!rows[0]) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(rows[0]);
  } catch (e) { console.error("programme:", (e as Error).message); return Response.json({ error: "database unavailable" }, { status: 503 }); }
}
