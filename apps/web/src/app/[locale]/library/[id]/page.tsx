import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Section, Badge, Callout } from "@/components/Chrome";
import Icon from "@/components/Icon";
import { getDocument } from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, t, params: p } = await loadPage(params);
  const d = (t.docs as Record<string, { title: string; summary: string }>)[p.id];
  return pageMeta(locale, `/library/${p.id}`, d?.title ?? p.id, d?.summary);
}

export default async function LibraryItem({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, t, L, params: p } = await loadPage(params);
  const lib = t.library;
  let doc = null; let error = false;
  try { doc = await getDocument(p.id); } catch (e) { console.error("document query failed:", (e as Error).message); error = true; }
  if (error) return <Section><div className="ndf-errorstate"><p className="ndf-callout__title">{t.errors.apiTitle}</p><p>{t.errors.apiText}</p></div></Section>;
  if (!doc) notFound();
  const local = (t.docs as Record<string, { title: string; summary: string }>)[doc.id];
  const used: { href: string; label: string }[] = [];
  const en = t;
  if (["NDF-FND-001", "NDF-FND-002", "NDF-FND-003"].includes(doc.id)) used.push({ href: "/about/story", label: en.nav.story }, { href: "/about/legal", label: en.nav.legal });
  if (["NDF-PRG-002", "NDF-PRG-003"].includes(doc.id)) used.push({ href: "/programmes/tank-renovation", label: en.nav.tank }, { href: "/about/approach", label: en.nav.approach });
  if (["NDF-PRF-001", "NDF-ACT-001"].includes(doc.id)) used.push({ href: "/programmes", label: en.nav.programmes }, { href: "/about/governance", label: en.nav.governance });
  if (["NDF-CON-001", "NDF-CON-002"].includes(doc.id)) used.push({ href: "/about/constitution", label: en.nav.constitution }, { href: "/about/governance", label: en.nav.governance });
  if (doc.id === "NDF-PRG-001") used.push({ href: "/programmes/biogas", label: "Biogas" });
  return (
    <>
      <PageHead eyebrow={doc.id} title={local?.title ?? doc.title} lede={local?.summary ?? doc.summary ?? undefined} />
      <Section>
        <ul className="ndf-crumbs"><li><Link href={L("/library")}>{lib.title}</Link></li><li>{doc.id}</li></ul>
        <div className="ndf-grid ndf-grid--2" style={{ alignItems: "start" }}>
          <div className="ndf-libcard">
            <dl className="ndf-libcard__meta">
              <dt>{lib.fields.id}</dt><dd>{doc.id}</dd>
              <dt>{lib.fields.type}</dt><dd>{doc.doc_type}</dd>
              <dt>{lib.fields.language}</dt><dd>{(lib.languages as Record<string, string>)[doc.language] ?? doc.language}</dd>
              <dt>{lib.fields.date}</dt><dd>{doc.date_label ?? t.common.notKnown}</dd>
              {doc.pages ? <><dt>{lib.fields.pages}</dt><dd>{doc.pages}</dd></> : null}
              <dt>{lib.fields.credit}</dt><dd>{doc.source_credit}</dd>
              <dt>{lib.fields.licence}</dt><dd>{doc.licence}</dd>
              <dt>{lib.fields.quality}</dt><dd>{doc.text_quality}</dd>
            </dl>
            <div className="ndf-row">
              {doc.original_url ? <a className="ndf-btn ndf-btn--primary" href={doc.original_url}><Icon name="download" /> {lib.download}</a> : null}
              {doc.external_url ? <a className="ndf-btn ndf-btn--secondary" href={doc.external_url} rel="noopener">{lib.external} <Icon name="external-link" /></a> : null}
              {!doc.original_url && !doc.external_url ? <span className="ndf-badge"><Icon name="info" />{lib.noOriginal}</span> : null}
            </div>
            {doc.notes ? <p className="ndf-card__meta">{lib.notesTitle}: {doc.notes}</p> : null}
            {used.length ? <div><p className="ndf-card__eyebrow">{lib.relatedTitle}</p><ul className="ndf-prose">{used.map((u) => <li key={u.href}><Link href={L(u.href)}>{u.label}</Link></li>)}</ul></div> : null}
          </div>
          <div>
            <h2>{lib.textTitle}</h2>
            <p>{doc.text_source?.startsWith("ocr") ? <span className="ndf-machine"><Icon name="scan-text" />{t.common.machineRead}</span> : doc.text_source === "manual_transcription" ? <span className="ndf-machine"><Icon name="scan-text" />{t.common.transcribed}</span> : <Badge icon="file-text">{t.common.retypedDraft}</Badge>}</p>
            {doc.body_text ? <div className="ndf-doc" lang={doc.language === "si" ? "si" : "en"}>{doc.body_text}</div> : <Callout kind="info"><p>{lib.noOriginal}</p></Callout>}
          </div>
        </div>
      </Section>
    </>
  );
}
