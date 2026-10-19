import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const admin = await requireAdmin(req).catch(() => null);
  if (!admin) return Response.json({ error: "unauthorised" }, { status: 401 });
  try {
    const s = new URL(req.url).searchParams; const limit = Math.min(200, Number(s.get("limit") || 50));
    const items = await query(`SELECT id, kind, name, email, phone, subject, place, left(message, 2000) AS message, locale, attachment_name, attachment_bytes, status, created_at FROM contact_messages ORDER BY created_at DESC LIMIT $1`, [limit]);
    const counts = await query(`SELECT status, count(*)::int AS n FROM contact_messages GROUP BY status`);
    await query("INSERT INTO audit_log (actor, action, detail) VALUES ($1, 'admin.messages.list', $2)", [admin.email, JSON.stringify({ limit })]);
    return Response.json({ items, counts });
  } catch (e) { console.error("admin messages:", (e as Error).message); return Response.json({ error: "database unavailable" }, { status: 503 }); }
}
