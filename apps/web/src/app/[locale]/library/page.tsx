import type { Metadata } from "next";
import Link from "next/link";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Section, Badge, Cite } from "@/components/Chrome";
import Icon from "@/components/Icon";
import { listDocuments, documentFacets, type DocRow } from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/library", t.library.title, t.library.lede);
}

export default async function Library({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { locale, t, L } = await loadPage(params);
  const sp = await searchParams;
  const lib = t.library;
  let items: DocRow[] = []; let total = 0; let facets = { types: [] as string[], langs: [] as string[], years: [] as number[] }; let error = false;
  try { ({ items, total } = await listDocuments({ type: sp.type, lang: sp.lang, year: sp.year, programme: sp.programme, q: sp.q })); facets = await documentFacets(); }
  catch (e) { console.error("library query failed:", (e as Error).message); error = true; }
  const titleOf = (d: DocRow) => (t.docs as Record<string, { title: string; summary: string }>)[d.id]?.title ?? d.title;
  const summaryOf = (d: DocRow) => (t.docs as Record<string, { title: string; summary: string }>)[d.id]?.summary ?? d.summary;
  return (
    <>
      <PageHead eyebrow={lib.eyebrow} title={lib.title} lede={lib.lede} />
      <Section>
        <p className="ndf-section__lede ndf-prose">{lib.intro}</p>
        <form method="get" action={L("/library")} className="ndf-stack">
          <div className="ndf-search">
            <label htmlFor="q" className="ndf-visually-hidden">{t.common.search}</label>
            <input id="q" name="q" className="ndf-input" defaultValue={sp.q || ""} placeholder={t.common.searchPlaceholder} />
            <button className="ndf-btn ndf-btn--primary" type="submit"><Icon name="search" /> {t.common.search}</button>
          </div>
          <div className="ndf-filters">
            <div className="ndf-field"><label className="ndf-field__label" htmlFor="type">{lib.filterType}</label><select id="type" name="type" className="ndf-select" defaultValue={sp.type || ""}><option value="">{t.common.all}</option>{facets.types.map((x) => <option key={x} value={x}>{x}</option>)}</select></div>
            <div className="ndf-field"><label className="ndf-field__label" htmlFor="lang">{lib.filterLang}</label><select id="lang" name="lang" className="ndf-select" defaultValue={sp.lang || ""}><option value="">{t.common.all}</option>{facets.langs.map((x) => <option key={x} value={x}>{(lib.languages as Record<string, string>)[x] ?? x}</option>)}</select></div>
            <div className="ndf-field"><label className="ndf-field__label" htmlFor="year">{lib.filterYear}</label><select id="year" name="year" className="ndf-select" defaultValue={sp.year || ""}><option value="">{t.common.all}</option>{facets.years.map((x) => <option key={x} value={x}>{x}</option>)}</select></div>
            <div className="ndf-field"><label className="ndf-field__label" htmlFor="programme">{lib.filterProgramme}</label><select id="programme" name="programme" className="ndf-select" defaultValue={sp.programme || ""}><option value="">{t.common.all}</option>{t.programmes.pages.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}</select></div>
            <div className="ndf-field" style={{ justifyContent: "end" }}><button className="ndf-btn ndf-btn--secondary" type="submit">{t.common.search}</button></div>
          </div>
        </form>
        {error ? <div className="ndf-errorstate"><p className="ndf-callout__title">{t.errors.apiTitle}</p><p>{t.errors.apiText}</p></div> : (
          <>
            <p className="ndf-card__meta">{total} {lib.count}</p>
            {items.length === 0 ? <p className="ndf-callout">{t.common.noResults}</p> : (
              <div className="ndf-grid ndf-grid--2">
                {items.map((d) => (
                  <article key={d.id} className="ndf-libcard ndf-reveal">
                    <div className="ndf-libcard__top"><Cite id={d.id} locale={locale} /><Badge>{d.doc_type}</Badge><Badge kind="info">{(lib.languages as Record<string, string>)[d.language] ?? d.language}</Badge>{d.date_label ? <Badge icon="calendar">{d.date_label}</Badge> : null}</div>
                    <h2 className="ndf-libcard__title"><Link href={L(`/library/${d.id}`)}>{titleOf(d)}</Link></h2>
                    <p className="ndf-card__body">{summaryOf(d)}</p>
                    <div className="ndf-libcard__note">{d.text_source?.startsWith("ocr") ? <span className="ndf-machine"><Icon name="scan-text" />{t.common.machineRead}</span> : d.text_source === "manual_transcription" ? <span className="ndf-machine"><Icon name="scan-text" />{t.common.transcribed}</span> : <span className="ndf-badge"><Icon name="file-text" />{t.common.retypedDraft}</span>}{d.original_url ? <span><Icon name="download" /> PDF</span> : null}{d.external_url ? <span><Icon name="external-link" /> {lib.external}</span> : null}</div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}
