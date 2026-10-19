import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Cite, Section, Callout } from "@/components/Chrome";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/about/governance", t.governance.title, t.governance.lede);
}

export default async function Governance({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t, L } = await loadPage(params);
  const g = t.governance;
  return (
    <>
      <PageHead eyebrow={g.eyebrow} title={g.title} lede={g.lede} />
      <Section>
        <p className="ndf-section__lede ndf-prose">{g.intro} <Cite id="NDF-CON-001" locale={locale} /></p>
        <Callout kind="warning" title={g.currentTitle}><p>{g.currentText}</p></Callout>
      </Section>
      <Section variant="sunken">
        <h2>{g.structureTitle}</h2>
        <div className="ndf-grid ndf-grid--3">
          {g.structure.map((s, i) => (
            <div key={i} className="ndf-card ndf-reveal"><h3 className="ndf-card__title">{s.title}</h3><p className="ndf-card__body">{s.text}</p></div>
          ))}
        </div>
        <p style={{ marginTop: "1rem" }}><Link href={L("/about/constitution")} className="ndf-link ndf-link--standalone">{t.nav.constitution} <Icon name="arrow-right" /></Link></p>
      </Section>
      <Section>
        <div className="ndf-grid ndf-grid--2">
          <div>
            <h2>{g.membershipTitle}</h2>
            {g.membership.map((m, i) => (<details key={i} className="ndf-acc"><summary>{m.title}<Icon name="chevron-down" className="ndf-acc__chev" /></summary><div className="ndf-acc__body"><p>{m.text}</p></div></details>))}
          </div>
          <div>
            <h2>{g.financeTitle}</h2>
            <p>{g.finance}</p>
            <h3>{g.bankersTitle}</h3>
            <p>{g.bankers} <Cite id="NDF-PRF-001" locale={locale} /></p>
          </div>
        </div>
      </Section>
      <Section variant="sunken">
        <h2>{g.officersTitle}</h2>
        <p className="ndf-card__meta">{g.officersNote}</p>
        <div className="ndf-table-wrap">
          <table className="ndf-table">
            <thead><tr><th>{t.common.period}</th><th>Name</th><th>Role</th><th>{t.common.source}</th></tr></thead>
            <tbody>{g.officers.map((o, i) => (<tr key={i}><td>{o.period}</td><td>{o.name}</td><td>{o.role}</td><td>{o.ref ? <Cite id={o.ref} locale={locale} /> : <span className="ndf-badge">{t.common.verified}</span>}</td></tr>))}</tbody>
          </table>
        </div>
        <h3 style={{ marginTop: "2rem" }}>{g.staffTitle}</h3>
        <p className="ndf-prose">{g.staff} <Cite id="NDF-PRF-001" locale={locale} /></p>
      </Section>
      <Section>
        <div className="ndf-split">
          <div><h2>{g.emblemTitle}</h2><p className="ndf-prose">{g.emblem} <Cite id="NDF-CON-001" locale={locale} /></p></div>
          <div className="ndf-card" style={{ alignItems: "center" }}><Image src="/logo/ndf-logo-black-480.png" alt={t.meta.siteName} width={480} height={324} style={{ width: "100%", maxWidth: "22rem", height: "auto" }} /></div>
        </div>
      </Section>
    </>
  );
}
