import type { Metadata } from "next";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Cite, Section, Figure, Callout } from "@/components/Chrome";
import Tabs from "@/components/Tabs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/about/approach", t.approach.title, t.approach.lede, "training.jpg");
}

export default async function Approach({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t } = await loadPage(params);
  const a = t.approach;
  return (
    <>
      <PageHead eyebrow={a.eyebrow} title={a.title} lede={a.lede} />
      <Section>
        <div className="ndf-split" style={{ alignItems: "start" }}>
          <div>
            <h2>{a.objectives1990Title}</h2>
            <p className="ndf-card__meta">{a.objectives1990Note} <Cite id="NDF-PRG-003" locale={locale} /> <Cite id="NDF-PRG-002" locale={locale} /></p>
            <ol className="ndf-prose">{a.objectives1990.map((o, i) => <li key={i}>{o}</li>)}</ol>
          </div>
          <Figure src="training.jpg" alt="" caption={t.common.illustration} />
        </div>
      </Section>
      <Section variant="sunken">
        <h2>{a.aimsTitle}</h2>
        <p className="ndf-card__meta">{a.aimsNote} <Cite id="NDF-CON-001" locale={locale} /></p>
        <ol className="ndf-grid ndf-grid--2" style={{ listStyle: "none", padding: 0, counterReset: "aim" }}>
          {a.aims.map((o, i) => (
            <li key={i} className="ndf-card ndf-reveal" style={{ margin: 0 }}>
              <span className="ndf-card__eyebrow">{i + 1}</span>
              <p className="ndf-card__body" style={{ color: "var(--text-body)" }}>{o}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section>
        <h2>{a.methodTitle}</h2>
        <p className="ndf-card__meta">{a.methodNote} <Cite id="NDF-PRG-003" locale={locale} /></p>
        <ol className="ndf-timeline">
          {a.method.map((m, i) => (
            <li key={i} className="ndf-tl ndf-tl--confirmed ndf-reveal">
              <span className="ndf-tl__date">{i + 1}</span>
              <span className="ndf-tl__rail"><span className="ndf-tl__dot" /></span>
              <div className="ndf-tl__body"><h3 className="ndf-tl__title">{m.title}</h3><p className="ndf-tl__text">{m.text}</p></div>
            </li>
          ))}
        </ol>
        <Callout kind="info" title={a.selectionTitle}><ul style={{ margin: 0 }}>{a.selection.map((s, i) => <li key={i}>{s}</li>)}</ul><p style={{ marginTop: "0.5rem" }}><Cite id="NDF-PRG-002" locale={locale} /></p></Callout>
      </Section>
      <Section variant="sunken">
        <h2>{a.visionTitle}</h2>
        <p className="ndf-card__meta">{a.visionNote} <Cite id="NDF-PRF-001" locale={locale} /></p>
        <Tabs tabs={[
          { label: "Vision", content: <blockquote className="ndf-card" style={{ margin: 0, fontSize: "var(--text-lg)" }}>{a.vision}</blockquote> },
          { label: "Mission", content: <ol className="ndf-prose">{a.mission.map((m, i) => <li key={i}>{m}</li>)}</ol> },
          { label: a.goalsTitle, content: <ol className="ndf-prose">{a.goals.map((m, i) => <li key={i}>{m}</li>)}</ol> },
          { label: a.methodologiesTitle, content: <div><p>{a.methodologiesNote} <Cite id="NDF-ACT-001" locale={locale} /></p><ul className="ndf-prose">{a.methodologies.map((m, i) => <li key={i}>{m}</li>)}</ul></div> },
        ]} />
      </Section>
      <Section>
        <h2>{a.independentTitle}</h2>
        <div className="ndf-grid ndf-grid--3">
          {a.independent.map((q, i) => (
            <blockquote key={i} className="ndf-card ndf-reveal" style={{ margin: 0 }}>
              <p className="ndf-card__eyebrow">{q.who}</p>
              <p className="ndf-card__body" style={{ color: "var(--text-body)" }}>{q.text}</p>
              <p className="ndf-card__meta"><Cite id={q.ref} locale={locale} /></p>
            </blockquote>
          ))}
        </div>
      </Section>
    </>
  );
}
