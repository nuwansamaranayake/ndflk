import "server-only";
import { createHash } from "node:crypto";
import { query } from "./db";

export async function requireAdmin(req: Request): Promise<{ email: string } | null> {
  const h = req.headers.get("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (!m) return null;
  const hash = createHash("sha256").update(m[1].trim()).digest("hex");
  const rows = await query<{ email: string }>("SELECT email FROM users WHERE token_hash = $1 AND role = 'admin' LIMIT 1", [hash]);
  return rows[0] ?? null;
}
