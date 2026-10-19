// Smoke test. Hits real endpoints with real data checks. Exits 1 on any failure.
// Usage: NDF_BASE_URL=http://localhost:3000 NDF_ADMIN_TOKEN=... node scripts/smoke.mjs [--tables <psql-count>]
const base = (process.env.NDF_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const token = process.env.NDF_ADMIN_TOKEN || "";
const expectedTables = Number(process.env.EXPECTED_TABLES || 14);
const tableCountArg = process.argv.indexOf("--tables") > -1 ? Number(process.argv[process.argv.indexOf("--tables") + 1]) : null;
let fail = 0;
const check = (name, ok, detail = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  " + detail}`); if (!ok) fail++; };
const j = async (p, init) => { const r = await fetch(base + p, init); let body = null; try { body = await r.json(); } catch {} return { status: r.status, body, headers: r.headers }; };

// 1. Health with a real DB call behind it
const h = await j("/api/health");
check("health ok and db ok", h.status === 200 && h.body?.status === "ok" && h.body?.db === "ok", JSON.stringify(h.body));

// 2. Business endpoints return real data
const p = await j("/api/programmes?locale=en");
check("programmes returns 12", p.body?.items?.length === 12, `got ${p.body?.items?.length}`);
check("programmes have titles", (p.body?.items || []).every((x) => x.title && x.summary));
const psi = await j("/api/programmes?locale=si");
check("programmes si has Sinhala text", (psi.body?.items || []).some((x) => /[඀-෿]/.test(x.title)));
const one = await j("/api/programmes/tank-renovation?locale=en");
check("programme detail", one.status === 200 && one.body?.slug === "tank-renovation");

const d = await j("/api/documents?lang=en");
check("documents non-empty (>= 6)", (d.body?.total || 0) >= 6, `got ${d.body?.total}`);
const dall = await j("/api/documents");
const ids = (dall.body?.items || []).map((x) => x.id);
check("registration records present", ids.includes("NDF-FND-001") && ids.includes("NDF-FND-002") && ids.includes("NDF-FND-003"), ids.join(","));
const doc = await j("/api/documents/NDF-FND-002");
check("NDF-FND-002 has text", (doc.body?.text || "").length > 200, `len ${(doc.body?.text || "").length}`);
const srch = await j("/api/documents?q=Kurunegala");
check("full-text search finds tank paper", (srch.body?.items || []).some((x) => x.id === "NDF-PRG-002"));
const nores = await j("/api/documents/NDF-ZZZ-999");
check("unknown document is 404", nores.status === 404);

// 3. Restricted and UWWO material must not be reachable
for (const id of ["NDF-ADM-001", "NDF-UWO-001", "NDF-UWO-009", "NDF-REF-038"]) {
  const r = await j(`/api/documents/${id}`);
  check(`${id} is not public`, r.status === 404 || r.status === 403, `status ${r.status}`);
}
check("no UWWO or restricted rows in list", !ids.some((x) => /^NDF-(UWO|ADM|REF)-/.test(x)));
check("private address not in any document text", !(await Promise.all(ids.map(async (id) => (await j(`/api/documents/${id}`)).body?.text || ""))).some((t) => /Yahampath|63\/2/.test(t)));

// 4. Admin endpoint with a real token
if (token) {
  const m = await j("/api/admin/messages", { headers: { Authorization: `Bearer ${token}` } });
  check("admin messages reachable", m.status === 200 && Array.isArray(m.body?.items), `status ${m.status}`);
} else { check("admin messages reachable", false, "NDF_ADMIN_TOKEN not set"); }
const noauth = await j("/api/admin/messages");
check("admin rejects no token", noauth.status === 401);

// 5. Form round trip
const r = await fetch(base + "/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Smoke Test", email: "smoke@example.invalid", message: "smoke", consent_version: "2026-10-19" }) });
check("contact accepted (202)", r.status === 202, `status ${r.status}`);
const bad = await fetch(base + "/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "", email: "nope", message: "" }) });
check("contact rejects bad input (400)", bad.status === 400, `status ${bad.status}`);
const nl = await fetch(base + "/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "smoke-nl@example.invalid", locale: "en", consent_version: "2026-10-19" }) });
check("newsletter accepted (202)", nl.status === 202, `status ${nl.status}`);
if (token) {
  const m2 = await j("/api/admin/messages?limit=5", { headers: { Authorization: `Bearer ${token}` } });
  check("smoke message stored", (m2.body?.items || []).some((x) => x.email === "smoke@example.invalid"));
}

// 6. Pages render in both languages with real content
for (const [path, needle] of [["/en", "Forty years"], ["/si", "ජාතික සංවර්ධන පදනම"], ["/en/programmes/tank-renovation", "Aralugaswewa"], ["/en/library", "NDF-FND-001"], ["/en/library/NDF-PRG-002", "Dayaratne"], ["/en/about/legal", "Under review"], ["/en/about/constitution", "MANAGEMENT COUNCIL"], ["/si/about/story", "1979"], ["/sitemap.xml", "/si/library/NDF-CON-001"]]) {
  const res = await fetch(base + path); const html = await res.text();
  check(`page ${path}`, res.status === 200 && html.includes(needle), `status ${res.status}, needle ${needle} ${html.includes(needle) ? "found" : "missing"}`);
}
const redirect = await fetch(base + "/", { redirect: "manual" });
check("root redirects to a locale", redirect.status === 307 && /\/(en|si)$/.test(redirect.headers.get("location") || ""), `${redirect.status} ${redirect.headers.get("location")}`);
const fonts = await fetch(base + "/fonts/NotoSansSinhala-sinhala.woff2", { method: "HEAD" });
check("sinhala font served", fonts.status === 200);
const pdf = await fetch(base + "/documents/NDF-FND-001_Gazette_No_151_of_24_July_1981_Societies_Ordinance.pdf", { method: "HEAD" });
check("gazette PDF served", pdf.status === 200);
const held = await fetch(base + "/documents/NDF-FND-003_Department_of_Social_Services_certificate_of_registration.pdf", { method: "HEAD" });
check("held scan (private address) not served", held.status === 404, `status ${held.status}`);

// 7. Table count (passed in from psql by the wrapper script)
if (tableCountArg !== null) check(`table count is ${expectedTables}`, tableCountArg === expectedTables, `got ${tableCountArg}`);

if (fail > 0) { console.log(`\n${fail} check(s) failed`); process.exit(1); }
console.log("\nAll checks passed");
