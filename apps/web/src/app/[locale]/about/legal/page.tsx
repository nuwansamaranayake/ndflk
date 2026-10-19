import type { Metadata } from "next";
import Link from "next/link";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Cite, Section, Callout } from "@/components/Chrome";
import Icon from "@/components/Icon";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/about/legal", t.legal.title, t.legal.lede);
}

type LegalMeta = { legal_status?: "confirmed" | "under_review" | "unknown"; legal_checked?: string; legal_document?: string | null };

export default async function Legal({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t, L } = await loadPage(params);
  const g = t.legal;
  let meta: LegalMeta | null = null; let dbError = false;
  try { const rows = await query<{ meta: LegalMeta }>("SELECT meta FROM pages WHERE slug = 'about/legal'"); meta = rows[0]?.meta ?? {}; } catch { dbError = true; }
  // Never render 'confirmed' without a recorded date and document.
  let state: "confirmed" | "under_review" | "unknown" = meta?.legal_status ?? "under_review";
  if (state === "confirmed" && !(meta?.legal_checked && meta?.legal_document)) state = "under_review";
  const checked = meta?.legal_checked ? `Status last reviewed on ${meta.legal_checked}.` : g.checked;
  return (
    <>
      <PageHead eyebrow={g.eyebrow} title={g.title} lede={g.lede} />
      <Section>
        {dbError ? <p className="ndf-errorstate">{t.errors.apiText}</p> : (
          <div className={`ndf-legal ${state === "confirmed" ? "ndf-legal--confirmed" : state === "unknown" ? "ndf-legal--unknown" : ""}`}>
            <div className="ndf-legal__head">
              <p className="ndf-legal__label">{g.statusLabel}</p>
              <span className="ndf-legal__state"><Icon name={state === "confirmed" ? "circle-check" : state === "unknown" ? "circle-help" : "clock"} /> {g.states[state]}</span>
            </div>
            <div className="ndf-legal__body">
              <p>{g.underReviewText}</p>
              {state === "confirmed" && meta?.legal_document ? <p><Cite id={meta.legal_document} locale={locale} /></p> : null}
              <p className="ndf-legal__checked">{checked}</p>
            </div>
          </div>
        )}
      </Section>
      <Section variant="sunken">
        <h2>{g.recordsTitle}</h2>
        <div className="ndf-grid ndf-grid--3">
          {g.records.map((r) => (
            <article key={r.id} className="ndf-card ndf-reveal">
              <p className="ndf-card__eyebrow">{r.date}</p>
              <h3 className="ndf-card__title">{r.title}</h3>
              <p className="ndf-card__body">{r.text}</p>
              <p className="ndf-card__meta"><Cite id={r.id} locale={locale} /></p>
              <Link href={L(`/library/${r.id}`)} className="ndf-link">{t.common.viewInLibrary} <Icon name="arrow-right" /></Link>
            </article>
          ))}
        </div>
      </Section>
      <Section>
        <div className="ndf-grid ndf-grid--2">
          <Callout kind="warning" title={g.regimeTitle}><p>{g.regimeText}</p></Callout>
          <Callout kind="info" title={g.objectsTitle}><p>{g.objectsText} <Cite id="NDF-FND-002" locale={locale} /></p></Callout>
        </div>
        <h2 style={{ marginTop: "2rem" }}>{g.dataTitle}</h2>
        <p>{g.dataText} <Link href={L("/legal/privacy")}>{t.nav.privacy}</Link>.</p>
      </Section>
    </>
  );
}
