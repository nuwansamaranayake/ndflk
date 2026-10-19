// Fails if a frontend fetch("/api/...") has no matching route handler, or a route is missing from docs/API_CONTRACT.md.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
const root = resolve(new URL(".", import.meta.url).pathname, "..");
function walk(d) { return readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; }); }
const src = walk(resolve(root, "src")).filter((f) => /\.(ts|tsx|mjs)$/.test(f));
const calls = new Set();
for (const f of src) for (const m of readFileSync(f, "utf8").matchAll(/fetch\((?:base \+ )?["'`]\/api\/([a-z0-9\-\/\[\]]+)/g)) calls.add("/api/" + m[1]);
for (const m of readFileSync(resolve(root, "../../scripts/smoke.mjs"), "utf8").matchAll(/["'`]\/api\/([a-z0-9\-\/]+)/g)) { let c = "/api/" + m[1].replace(/\/$/, ""); c = c.replace(/\/NDF-[A-Z]+-\d+$/, "/[docId]").replace(/\/tank-renovation$/, "/[slug]"); if (c !== "/api/documents/") calls.add(c); }
const routes = new Set(walk(resolve(root, "src/app/api")).filter((f) => f.endsWith("route.ts")).map((f) => "/api" + f.split("/src/app/api")[1].replace(/\/route\.ts$/, "")));
const contract = readFileSync(resolve(root, "../../docs/API_CONTRACT.md"), "utf8");
let bad = 0;
for (const c of calls) { const norm = c.replace(/\/[^/]+$/, (s) => (routes.has(c) ? s : s)); if (!routes.has(norm) && ![...routes].some((r) => r.includes("[") && new RegExp("^" + r.replace(/\[[^\]]+\]/g, "[^/]+") + "$").test(c))) { console.log(`NO ROUTE  ${c}`); bad++; } }
for (const r of routes) { if (!contract.includes(r.replace(/\[docId\]/, "{docId}").replace(/\[slug\]/, "{slug}"))) { console.log(`NOT IN CONTRACT  ${r}`); bad++; } }
console.log(`${calls.size} frontend calls, ${routes.size} routes, ${bad} problems`);
process.exit(bad ? 1 : 0);
