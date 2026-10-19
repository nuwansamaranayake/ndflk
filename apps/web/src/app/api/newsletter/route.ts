import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { query } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { notify } from "@/lib/mail";
export const dynamic = "force-dynamic";
const Body = z.object({ email: z.string().email().max(200), name: z.string().max(120).optional(), locale: z.enum(["en", "si", "ta"]).default("en"), interests: z.array(z.string().max(40)).max(8).default([]), consent_version: z.string().max(40), website: z.string().max(0).optional() });
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`nl:${ip}`, 5)) return Response.json({ error: "too many requests" }, { status: 429 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid input" }, { status: 400 });
  const b = parsed.data;
  const token = randomBytes(24).toString("hex");
  try {
    await query(
      `INSERT INTO newsletter_subscribers (email, name, locale, interests, consent_version, confirm_token, ip_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (email) DO UPDATE SET name = COALESCE(EXCLUDED.name, newsletter_subscribers.name), locale = EXCLUDED.locale, interests = EXCLUDED.interests, consent_version = EXCLUDED.consent_version, consented_at = now(), confirm_token = CASE WHEN newsletter_subscribers.confirmed_at IS NULL THEN EXCLUDED.confirm_token ELSE newsletter_subscribers.confirm_token END, unsubscribed_at = NULL`,
      [b.email.toLowerCase(), b.name ?? null, b.locale, b.interests, b.consent_version, token, createHash("sha256").update(ip).digest("hex").slice(0, 32)]);
    const base = process.env.SITE_URL || "https://ndflk.org";
    await notify(`NDF newsletter: confirm ${b.email}`, `Confirm link: ${base}/api/newsletter/confirm?token=${token}\n\nSend this to the subscriber from the monitored mailbox until automated sending is set up.`);
    return new Response(null, { status: 202 });
  } catch (e) { console.error("newsletter:", (e as Error).message); return Response.json({ error: "could not save subscription" }, { status: 503 }); }
}
