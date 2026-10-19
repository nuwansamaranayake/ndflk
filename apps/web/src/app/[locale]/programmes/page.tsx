import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Cite, Section, Badge, Callout } from "@/components/Chrome";
import Icon from "@/components/Icon";
import Tabs from "@/components/Tabs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/programmes", t.programmes.title, t.programmes.lede, "biogas.jpg");
}

export default async function Programmes({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t, L } = await loadPage(params);
  const p = t.programmes;
  const badge = (s: string) => s === "evidence" ? <Badge kind="success" icon="circle-check">{p.statusLabels.evidence}</Badge> : <Badge kind="warning" icon="archive">{p.statusLabels.records}</Badge>;
  return (
    <>
      <PageHead eyebrow={p.eyebrow} title={p.title} lede={p.lede} />
      <Section>
        <p className="ndf-section__lede ndf-prose">{p.intro}</p>
        <h2>{p.cardsTitle}</h2>
        <div className="ndf-grid ndf-grid--3">
          {p.pages.map((c) => (
            <article key={c.slug} className="ndf-card ndf-card--link ndf-reveal">
              <div className="ndf-card__img"><Image src={`/img/${c.img.replace(".jpg", "-800.jpg")}`} alt="" width={800} height={450} sizes="(max-width: 48em) 100vw, 33vw" /></div>
              <div>{badge(c.status)}</div>
              <h3 className="ndf-card__title"><Link href={L(`/programmes/${c.slug}`)}>{c.title}</Link></h3>
              <p className="ndf-card__body">{c.summary}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section variant="sunken">
        <h2>{p.projects1997Title}</h2>
        <p className="ndf-card__meta">{p.projects1997Note} <Cite id="NDF-PRF-001" locale={locale} /></p>
        <div className="ndf-table-wrap">
          <table className="ndf-table">
            <thead><tr><th>#</th><th>{t.common.programme}</th><th>{t.common.funder}</th><th className="ndf-num">{t.common.value}</th><th>{t.common.period}</th></tr></thead>
            <tbody>{p.projects1997.map((r) => (<tr key={r.n}><td>{r.n}</td><td><Link href={L(`/programmes/${r.slug}`)}>{r.title}</Link></td><td>{r.support}</td><td className="ndf-num">{r.value}</td><td>{r.period}</td></tr>))}</tbody>
          </table>
        </div>
        <p className="ndf-card__meta" style={{ marginTop: "0.5rem" }}>{t.common.rupees1980s}</p>
        <div className="ndf-grid" style={{ marginTop: "2rem" }}>
          <div>
            <h3>{p.orgsTitle}</h3>
            <p className="ndf-card__meta">{p.orgsNote} <Cite id="NDF-PRF-001" locale={locale} /></p>
            <div className="ndf-proof">{p.orgs.map((o, i) => <div key={i} className="ndf-stat"><span className="ndf-stat__value">{o.value}</span><span className="ndf-stat__label">{o.label}</span></div>)}</div>
          </div>
        </div>
      </Section>
      <Section>
        <h2>{p.activitiesTitle}</h2>
        <p className="ndf-card__meta">{p.activitiesNote} <Cite id="NDF-ACT-001" locale={locale} /></p>
        <Tabs tabs={p.activityGroups.map((g) => ({ label: g.title, content: <ol className="ndf-prose">{g.items.map((it, i) => <li key={i}>{it}</li>)}</ol> }))} />
      </Section>
      <Section variant="sunken">
        <Callout kind="records" title={t.common.recordsWanted}><p>{t.common.recordsWantedText}</p><div className="ndf-callout__actions"><Link href={L("/records-wanted")} className="ndf-btn ndf-btn--clay">{t.common.tellUs} <Icon name="arrow-right" /></Link></div></Callout>
      </Section>
    </>
  );
}
