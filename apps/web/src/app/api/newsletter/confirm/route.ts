import { query } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  if (!/^[a-f0-9]{48}$/.test(token)) return Response.json({ error: "invalid token" }, { status: 400 });
  try {
    const rows = await query<{ email: string }>("UPDATE newsletter_subscribers SET confirmed_at = now(), confirm_token = NULL WHERE confirm_token = $1 AND confirmed_at IS NULL RETURNING email", [token]);
    if (!rows[0]) return Response.json({ error: "token not found or already used" }, { status: 404 });
    return new Response("<!doctype html><meta charset=utf-8><title>NDF</title><p style='font-family:sans-serif;padding:2rem'>Thank you. Your email is confirmed. <a href='/'>Back to ndflk.org</a></p>", { headers: { "content-type": "text/html; charset=utf-8" } });
  } catch (e) { console.error("confirm:", (e as Error).message); return Response.json({ error: "database unavailable" }, { status: 503 }); }
}
