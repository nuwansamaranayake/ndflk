import type { Metadata } from "next";
import Link from "next/link";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Section, Badge } from "@/components/Chrome";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/news", t.news.title, t.news.lede);
}

export default async function News({ params }: { params: Promise<{ locale: string }> }) {
  const { t, L } = await loadPage(params);
  return (
    <>
      <PageHead eyebrow={t.news.eyebrow} title={t.news.title} lede={t.news.lede} />
      <Section>
        <div className="ndf-stack" style={{ maxWidth: "48rem" }}>
          {t.news.posts.map((p) => (
            <article key={p.slug} className="ndf-card ndf-card--link ndf-reveal">
              <p className="ndf-card__eyebrow"><Badge icon="calendar">{p.date}</Badge></p>
              <h2 className="ndf-card__title"><Link href={L(`/news/${p.slug}`)}>{p.title}</Link></h2>
              <p className="ndf-card__body">{p.summary}</p>
              <span className="ndf-link">{t.common.readMore} <Icon name="arrow-right" /></span>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
