import type { Metadata } from "next";
import Link from "next/link";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Cite, Section, Figure, Callout, Badge } from "@/components/Chrome";
import Icon from "@/components/Icon";
import Counter from "@/components/Counter";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/programmes/tank-renovation", t.tank.title, t.tank.lede, "tank-work.jpg");
}

export default async function Tank({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t, L } = await loadPage(params);
  const k = t.tank; const a = t.approach;
  const max = Math.max(...k.tanks.map((x) => x.after));
  const sum = (key: "before" | "after" | "farmers") => k.tanks.reduce((s, x) => s + x[key], 0);
  return (
    <>
      <PageHead eyebrow={k.eyebrow} title={k.title} lede={k.lede} />
      <Section>
        <ul className="ndf-crumbs"><li><Link href={L("/programmes")}>{t.nav.programmes}</Link></li><li>{k.title}</li></ul>
        <p><Badge kind="success" icon="circle-check">{t.programmes.statusLabels.evidence}</Badge> <Cite id="NDF-PRG-002" locale={locale} /> <Cite id="NDF-PRG-003" locale={locale} /></p>
        <div className="ndf-split" style={{ alignItems: "start" }}>
          <div className="ndf-prose"><h2>{k.problemTitle}</h2><p>{k.problemText}</p><h2>{k.methodTitle}</h2><p>{k.methodText}</p></div>
          <Figure src="tank-work.jpg" alt="" caption={t.common.illustration} priority />
        </div>
        <ol className="ndf-timeline" style={{ marginTop: "2rem" }}>
          {a.method.map((m, i) => (
            <li key={i} className="ndf-tl ndf-tl--confirmed ndf-reveal">
              <span className="ndf-tl__date">{i + 1}</span><span className="ndf-tl__rail"><span className="ndf-tl__dot" /></span>
              <div className="ndf-tl__body"><h3 className="ndf-tl__title">{m.title}</h3><p className="ndf-tl__text">{m.text}</p></div>
            </li>
          ))}
        </ol>
      </Section>

      <Section variant="sunken">
        <h2>{k.resultsTitle}</h2>
        <p className="ndf-card__meta">{k.resultsNote} <Cite id="NDF-PRG-002" locale={locale} /></p>
        <div className="ndf-proof">
          {k.resultStats.map((s, i) => <div key={i} className="ndf-stat ndf-reveal"><span className="ndf-stat__value" style={{ fontSize: "var(--text-2xl)" }}><Counter value={s.value} /></span><span className="ndf-stat__label">{s.label}</span></div>)}
        </div>
        <div className="ndf-grid ndf-grid--2" style={{ marginTop: "2rem" }}>
          <div className="ndf-card">
            <h3 className="ndf-card__title">{k.chartTitle}</h3>
            <div className="ndf-legend"><span><i className="ndf-legend__swatch" style={{ background: "var(--color-water-500)" }} />{k.before}</span><span><i className="ndf-legend__swatch" style={{ background: "var(--color-paddy-500)" }} />{k.after}</span></div>
            <div className="ndf-bars" role="img" aria-label={k.chartTitle}>
              {k.tanks.map((x) => (
                <div key={x.name}>
                  <div className="ndf-bar"><span>{x.name}</span><span className="ndf-bar__track"><span className="ndf-bar__fill" style={{ width: `${(x.before / max) * 100}%` }} /></span><span className="ndf-bar__val">{x.before}</span></div>
                  <div className="ndf-bar"><span /><span className="ndf-bar__track"><span className="ndf-bar__fill ndf-bar__fill--after" style={{ width: `${(x.after / max) * 100}%` }} /></span><span className="ndf-bar__val">{x.after}</span></div>
                </div>
              ))}
            </div>
            <p className="ndf-card__meta">{k.chartNote}</p>
          </div>
          <div>
            <div className="ndf-table-wrap">
              <table className="ndf-table">
                <caption>{k.chartTitle}</caption>
                <thead><tr><th>Tank</th><th className="ndf-num">Farmers</th><th className="ndf-num">{k.before}</th><th className="ndf-num">{k.after}</th><th className="ndf-num">%</th></tr></thead>
                <tbody>
                  {k.tanks.map((x) => <tr key={x.name}><td>{x.name}</td><td className="ndf-num">{x.farmers}</td><td className="ndf-num">{x.before}</td><td className="ndf-num">{x.after}</td><td className="ndf-num">{x.after === x.before ? 0 : Math.round(((x.after - x.before) / x.before) * 1000) / 10}</td></tr>)}
                  <tr><th>Total</th><th className="ndf-num">{sum("farmers")}</th><th className="ndf-num">{sum("before")}</th><th className="ndf-num">{sum("after")}</th><th className="ndf-num">{Math.round(((sum("after") - sum("before")) / sum("before")) * 100)}</th></tr>
                </tbody>
              </table>
            </div>
            <div className="ndf-table-wrap" style={{ marginTop: "1.5rem" }}>
              <table className="ndf-table">
                <caption>{k.yieldTitle}</caption>
                <thead><tr><th>kg/ha</th><th className="ndf-num">{k.before}</th><th className="ndf-num">{k.after}</th></tr></thead>
                <tbody>{k.yieldRows.map((y) => <tr key={y.band}><td>{y.band}</td><td className="ndf-num">{y.before || "-"}</td><td className="ndf-num">{y.after || "-"}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="ndf-split" style={{ alignItems: "start" }}>
          <div>
            <h2>{k.costTitle}</h2>
            <p className="ndf-card__meta">{k.costNote} <Cite id="NDF-PRG-002" locale={locale} /></p>
            <div className="ndf-table-wrap"><table className="ndf-table"><tbody>{k.costs.map((c) => <tr key={c.label}><td>{c.label}</td><td className="ndf-num">{c.value}</td></tr>)}</tbody></table></div>
            <p style={{ marginTop: "1rem" }}>{k.costText}</p>
            <p>{k.fundersText} <Cite id="NDF-PRG-003" locale={locale} /></p>
          </div>
          <div>
            <h2>{k.independentTitle}</h2>
            {a.independent.map((q, i) => <blockquote key={i} className="ndf-card ndf-reveal" style={{ margin: "0 0 1rem" }}><p className="ndf-card__eyebrow">{q.who}</p><p className="ndf-card__body" style={{ color: "var(--text-body)" }}>{q.text}</p><p className="ndf-card__meta"><Cite id={q.ref} locale={locale} /></p></blockquote>)}
          </div>
        </div>
      </Section>

      <Section variant="sunken">
        <div className="ndf-grid ndf-grid--2">
          <Callout kind="warning" title={k.unknownTitle}><ul style={{ margin: 0 }}>{k.unknown.map((u, i) => <li key={i}>{u}</li>)}</ul></Callout>
          <div>
            <h3>{k.sourcesTitle}</h3>
            <ul>
              <li><Link href={L("/library/NDF-PRG-002")}>{t.docs["NDF-PRG-002"].title}</Link></li>
              <li><Link href={L("/library/NDF-PRG-003")}>{t.docs["NDF-PRG-003"].title}</Link></li>
              <li><Link href={L("/library/NDF-PRF-001")}>{t.docs["NDF-PRF-001"].title}</Link></li>
            </ul>
            <Link href={L("/records-wanted")} className="ndf-btn ndf-btn--clay">{t.common.tellUs} <Icon name="arrow-right" /></Link>
          </div>
        </div>
      </Section>
    </>
  );
}
