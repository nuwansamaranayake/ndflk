import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Cite, Section, Figure, Callout, Badge } from "@/components/Chrome";
import Icon from "@/components/Icon";
import { enContent } from "@/lib/content";

export function generateStaticParams() {
  return enContent.programmes.pages.filter((p) => p.slug !== "tank-renovation").flatMap((p) => [{ locale: "en", slug: p.slug }, { locale: "si", slug: p.slug }]);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, t, params: p } = await loadPage(params);
  const card = t.programmes.pages.find((x) => x.slug === p.slug);
  if (!card) return {};
  return pageMeta(locale, `/programmes/${p.slug}`, card.title, card.summary, card.img);
}

export default async function Programme({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, t, L, params: p } = await loadPage(params);
  const card = t.programmes.pages.find((x) => x.slug === p.slug);
  const detail = (t.programmeDetail as Record<string, { eyebrow: string; body: string[]; refs: string[] }>)[p.slug];
  if (!card || !detail) notFound();
  const projects = t.programmes.projects1997.filter((x) => x.slug === p.slug);
  return (
    <>
      <PageHead eyebrow={detail.eyebrow} title={card.title} lede={card.summary} />
      <Section>
        <ul className="ndf-crumbs"><li><Link href={L("/programmes")}>{t.nav.programmes}</Link></li><li>{card.title}</li></ul>
        <div className="ndf-split" style={{ alignItems: "start" }}>
          <div className="ndf-prose">
            <p><Badge kind="warning" icon="archive">{t.programmes.statusLabels.records}</Badge></p>
            {detail.body.map((b, i) => <p key={i}>{b}</p>)}
            <p>{t.common.sources}: {detail.refs.map((r) => <span key={r}><Cite id={r} locale={locale} /> </span>)}</p>
          </div>
          <Figure src={card.img} alt="" caption={t.common.illustration} />
        </div>
      </Section>
      {projects.length ? (
        <Section variant="sunken">
          <div className="ndf-table-wrap">
            <table className="ndf-table">
              <caption>{t.programmes.projects1997Title}</caption>
              <thead><tr><th>{t.common.programme}</th><th>{t.common.funder}</th><th className="ndf-num">{t.common.value}</th><th>{t.common.period}</th></tr></thead>
              <tbody>{projects.map((r) => <tr key={r.n}><td>{r.title}</td><td>{r.support}</td><td className="ndf-num">{r.value}</td><td>{r.period}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="ndf-card__meta" style={{ marginTop: "0.5rem" }}>{t.common.rupees1980s} <Cite id="NDF-PRF-001" locale={locale} /></p>
        </Section>
      ) : null}
      <Section>
        <Callout kind="records" title={t.common.recordsWanted}><p>{t.common.recordsWantedText}</p><div className="ndf-callout__actions"><Link href={L("/records-wanted")} className="ndf-btn ndf-btn--clay">{t.common.tellUs} <Icon name="arrow-right" /></Link></div></Callout>
      </Section>
    </>
  );
}
