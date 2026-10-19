import "server-only";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __ndfPool: Pool | undefined;
}
export function getPool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!globalThis.__ndfPool) {
    globalThis.__ndfPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 8, idleTimeoutMillis: 30_000 });
  }
  return globalThis.__ndfPool;
}
export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await getPool().query(text, params);
  return res.rows as T[];
}
