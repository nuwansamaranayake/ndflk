import type { Metadata } from "next";
import Link from "next/link";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Cite, Section, Callout } from "@/components/Chrome";
import Icon from "@/components/Icon";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/about/constitution", t.constitution.title, t.constitution.lede);
}

function loadArticles(): { heading: string; body: string }[] {
  // Parses the retyped English constitution text into articles for the accordion.
  let text = "";
  try { text = readFileSync(resolve(process.cwd(), process.env.CORPUS_DIR || "../../corpus", "text/NDF-CON-001.txt"), "utf8"); } catch { return []; }
  const start = text.indexOf("1. NAME"); const end = text.indexOf("Amendments made to the constitution");
  const core = text.slice(start, end > 0 ? end : undefined).replace(/\r/g, "");
  const cleaned = core.split("\n").filter((l) => !/Retyped draft for review|National Development Foundation \| The Constitution|^\s*\[Scan page/.test(l)).join("\n");
  const parts = cleaned.split(/\n(?=\s*\d{1,2}(?: \[\?\])?\.\s+[A-Z][A-Z ,'-]+\s*\n)/);
  return parts.map((p) => { const lines = p.trim().split("\n"); return { heading: lines[0].trim(), body: lines.slice(1).join("\n").replace(/[ \t]+\n/g, "\n").trim() }; }).filter((a) => a.heading && a.body);
}

export default async function Constitution({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t, L } = await loadPage(params);
  const c = t.constitution;
  const articles = loadArticles();
  return (
    <>
      <PageHead eyebrow={c.eyebrow} title={c.title} lede={c.lede} />
      <Section>
        <Callout kind="info" title={t.common.retypedDraft}><p>{c.note}</p><p><Cite id="NDF-CON-001" locale={locale} /> <Cite id="NDF-CON-002" locale={locale} /></p></Callout>
      </Section>
      <Section variant="sunken">
        <h2>{c.amendmentsTitle}</h2>
        <ul className="ndf-prose">{c.amendments.map((a, i) => <li key={i}>{a}</li>)}</ul>
      </Section>
      <Section>
        <h2>{t.nav.constitution}</h2>
        {articles.length === 0 ? <p className="ndf-errorstate">{t.common.loadError}</p> : articles.map((a, i) => (
          <details key={i} className="ndf-acc" open={i < 2}>
            <summary>{a.heading}<Icon name="chevron-down" className="ndf-acc__chev" /></summary>
            <div className="ndf-acc__body"><pre style={{ whiteSpace: "pre-wrap", font: "inherit", margin: 0 }}>{a.body}</pre></div>
          </details>
        ))}
        <p style={{ marginTop: "1.5rem" }}><Link href={L("/library/NDF-CON-001")} className="ndf-link ndf-link--standalone">{t.common.viewInLibrary} <Icon name="arrow-right" /></Link></p>
      </Section>
      <Section variant="sunken">
        <h2>{c.openTitle}</h2>
        <ol className="ndf-prose">{c.open.map((o, i) => <li key={i}>{o}</li>)}</ol>
      </Section>
    </>
  );
}
