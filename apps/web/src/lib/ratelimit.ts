import "server-only";
// Simple in-memory limiter per process. Enough for one container behind Traefik; move to Postgres if scaled out.
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) { buckets.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}
export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  return (xf?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}
