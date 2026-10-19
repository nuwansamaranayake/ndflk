// Applies db/migrations/*.sql in order, then asserts the expected table count.
// Usage: node scripts/migrate.mjs   (reads DATABASE_URL, EXPECTED_TABLES default 14 incl. schema_migrations)
import pg from "pg";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dir = process.env.MIGRATIONS_DIR || resolve(here, "../../../db/migrations");
const expected = Number(process.env.EXPECTED_TABLES || 14); // 13 app tables + schema_migrations
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set"); process.exit(1); }

const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
const done = new Set((await client.query("SELECT version FROM schema_migrations")).rows.map(r => r.version));
const files = readdirSync(dir).filter(f => f.endsWith(".sql")).sort();
for (const f of files) {
  if (done.has(f)) { console.log(`skip  ${f}`); continue; }
  const sql = readFileSync(resolve(dir, f), "utf8");
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations(version) VALUES ($1)", [f]);
    await client.query("COMMIT");
    console.log(`apply ${f}`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(`FAIL  ${f}: ${e.message}`);
    process.exit(1);
  }
}
const { rows } = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY 1");
console.log(`tables (${rows.length}): ${rows.map(r => r.table_name).join(", ")}`);
await client.end();
if (rows.length !== expected) { console.error(`Expected ${expected} tables, found ${rows.length}`); process.exit(1); }
console.log("table count OK");
