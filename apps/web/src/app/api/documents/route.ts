import { listDocuments } from "@/lib/documents";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const s = new URL(req.url).searchParams;
  try {
    const { items, total } = await listDocuments({ type: s.get("type") || undefined, lang: s.get("lang") || undefined, year: s.get("year") || undefined, programme: s.get("programme") || undefined, q: s.get("q") || undefined });
    return Response.json({ items, total });
  } catch (e) { console.error("documents:", (e as Error).message); return Response.json({ error: "database unavailable" }, { status: 503 }); }
}
