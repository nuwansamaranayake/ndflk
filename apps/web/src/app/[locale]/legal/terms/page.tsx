import type { Metadata } from "next";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Section } from "@/components/Chrome";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/legal/terms", t.terms.title);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { t } = await loadPage(params);
  const p = t.terms;
  return (
    <>
      <PageHead eyebrow={p.eyebrow} title={p.title} lede={`${t.common.lastUpdated}: ${p.updated}`} />
      <Section>
        <div className="ndf-prose">{p.sections.map((s, i) => <section key={i}><h2>{s.title}</h2><p>{s.text}</p></section>)}</div>
      </Section>
    </>
  );
}
