import type { Metadata } from "next";
import Link from "next/link";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Cite, Callout, Section, Figure, Badge } from "@/components/Chrome";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/about/story", t.story.title, t.story.lede, "records.jpg");
}

export default async function Story({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t, L } = await loadPage(params);
  const s = t.story;
  const stateBadge = (st: string) => st === "confirmed" ? <Badge kind="success" icon="circle-check">{t.common.verified}</Badge> : st === "gap" ? <Badge kind="warning" icon="circle-help">{t.common.recordsWanted}</Badge> : <Badge kind="info" icon="info">{t.common.family}</Badge>;
  return (
    <>
      <PageHead eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
      <Section>
        <div className="ndf-split" style={{ alignItems: "start" }}>
          <div className="ndf-prose"><p className="ndf-section__lede">{s.intro}</p></div>
          <Figure src="records.jpg" alt="" caption={t.common.illustration} />
        </div>
      </Section>
      <Section variant="sunken">
        <ol className="ndf-timeline">
          {s.timeline.map((e, i) => (
            <li key={i} className={`ndf-tl ${e.state === "confirmed" ? "ndf-tl--confirmed" : e.state === "gap" ? "ndf-tl--gap" : ""} ndf-reveal`}>
              <span className="ndf-tl__date">{e.year}</span>
              <span className="ndf-tl__rail"><span className="ndf-tl__dot" /></span>
              <div className="ndf-tl__body">
                <h2 className="ndf-tl__title">{e.title}</h2>
                <p className="ndf-tl__text">{e.text}</p>
                <div className="ndf-tl__refs">{stateBadge(e.state)}{e.refs.map((r) => <Cite key={r} id={r} locale={locale} />)}</div>
              </div>
            </li>
          ))}
        </ol>
      </Section>
      <Section>
        <Callout kind="records" title={s.gapTitle}>
          <p>{s.gapText}</p>
          <div className="ndf-callout__actions"><Link href={L("/records-wanted")} className="ndf-btn ndf-btn--clay">{t.common.tellUs} <Icon name="arrow-right" /></Link></div>
        </Callout>
      </Section>
    </>
  );
}
