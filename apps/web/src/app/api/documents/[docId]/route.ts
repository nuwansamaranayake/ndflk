import { getDocument } from "@/lib/documents";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, { params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params;
  try {
    const d = await getDocument(docId);
    if (!d) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ ...d, text: d.body_text ?? "", body_text: undefined });
  } catch (e) { console.error("document:", (e as Error).message); return Response.json({ error: "database unavailable" }, { status: 503 }); }
}
