import { query } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  let db = "error";
  try { const r = await query<{ n: number }>("SELECT count(*)::int AS n FROM documents"); db = r[0] ? "ok" : "error"; } catch (e) { console.error("health db:", (e as Error).message); }
  return Response.json({ status: db === "ok" ? "ok" : "degraded", db, version: process.env.APP_VERSION || "dev", time: new Date().toISOString() }, { status: db === "ok" ? 200 : 503 });
}
