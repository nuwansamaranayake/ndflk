import "server-only";
import { z } from "zod";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { query } from "./db";
import { rateLimit, clientIp } from "./ratelimit";
import { notify } from "./mail";

const KINDS = ["contact", "former_staff", "community", "partner", "researcher", "volunteer", "donor", "records_offer", "memory"] as const;
const Body = z.object({
  kind: z.enum(KINDS).default("contact"), name: z.string().trim().min(1).max(120), email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")), subject: z.string().trim().max(120).optional().or(z.literal("")), place: z.string().trim().max(160).optional().or(z.literal("")),
  role: z.string().trim().max(40).optional().or(z.literal("")), message: z.string().trim().min(1).max(8000), locale: z.enum(["en", "si", "ta"]).default("en"), consent_version: z.string().max(40), website: z.string().max(0).optional().or(z.literal("")),
});
const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/png", "image/tiff", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);

export async function handleForm(req: Request, allowFile: boolean, fixedKind?: (typeof KINDS)[number]): Promise<Response> {
  const ip = clientIp(req);
  if (!rateLimit(`form:${ip}`, 8)) return Response.json({ error: "too many requests" }, { status: 429 });
  let raw: Record<string, unknown> = {}; let file: File | null = null;
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("multipart/form-data")) {
    const fd = await req.formData();
    for (const [k, v] of fd.entries()) { if (v instanceof File) { if (k === "file" && v.size > 0) file = v; } else raw[k] = v; }
  } else { raw = (await req.json().catch(() => ({}))) as Record<string, unknown>; }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "invalid input", issues: parsed.error.issues.map((i) => i.path.join(".")) }, { status: 400 });
  const b = parsed.data;
  if (b.website) return new Response(null, { status: 202 }); // spam trap: accept silently, store nothing
  const kind = fixedKind ?? (KINDS.includes(b.role as never) ? (b.role as (typeof KINDS)[number]) : b.kind);
  let attachment: { path: string; name: string; bytes: number } | null = null;
  if (file && allowFile) {
    if (file.size > 10 * 1024 * 1024) return Response.json({ error: "file too large (10 MB limit)" }, { status: 413 });
    if (!ALLOWED.has(file.type)) return Response.json({ error: "file type not accepted" }, { status: 415 });
    const dir = process.env.UPLOAD_DIR || resolve(process.cwd(), "uploads-quarantine");
    await mkdir(dir, { recursive: true });
    const safe = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80);
    const name = `${Date.now()}-${createHash("sha1").update(ip + safe).digest("hex").slice(0, 8)}-${safe}`;
    await writeFile(resolve(dir, name), Buffer.from(await file.arrayBuffer()));
    attachment = { path: resolve(dir, name), name: file.name, bytes: file.size };
  }
  try {
    const rows = await query<{ id: string }>(
      `INSERT INTO contact_messages (kind, name, email, phone, subject, place, message, locale, attachment_path, attachment_name, attachment_bytes, consent_version, ip_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [kind, b.name, b.email.toLowerCase(), b.phone || null, b.subject || null, b.place || null, b.message, b.locale, attachment?.path ?? null, attachment?.name ?? null, attachment?.bytes ?? null, b.consent_version, createHash("sha256").update(ip).digest("hex").slice(0, 32)]);
    await notify(`NDF site: ${kind} from ${b.name}`, `Kind: ${kind}\nName: ${b.name}\nEmail: ${b.email}\nPhone: ${b.phone || "-"}\nSubject: ${b.subject || "-"}\nPlace: ${b.place || "-"}\nLocale: ${b.locale}\nAttachment: ${attachment?.name || "-"}\n\n${b.message}\n\nid: ${rows[0].id}`);
    return new Response(null, { status: 202 });
  } catch (e) { console.error("form:", (e as Error).message); return Response.json({ error: "could not save message" }, { status: 503 }); }
}
