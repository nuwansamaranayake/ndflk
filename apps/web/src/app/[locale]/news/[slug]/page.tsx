import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Section, Badge } from "@/components/Chrome";
import { enContent } from "@/lib/content";

export function generateStaticParams() { return enContent.news.posts.flatMap((p) => [{ locale: "en", slug: p.slug }, { locale: "si", slug: p.slug }]); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, t, params: p } = await loadPage(params);
  const post = t.news.posts.find((x) => x.slug === p.slug);
  return post ? pageMeta(locale, `/news/${p.slug}`, post.title, post.summary) : {};
}

export default async function Post({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { t, L, params: p } = await loadPage(params);
  const post = t.news.posts.find((x) => x.slug === p.slug);
  if (!post) notFound();
  return (
    <>
      <PageHead eyebrow={post.date} title={post.title} lede={post.summary} />
      <Section>
        <ul className="ndf-crumbs"><li><Link href={L("/news")}>{t.news.title}</Link></li><li>{post.date}</li></ul>
        <article className="ndf-prose">{post.body.map((b, i) => <p key={i}>{b}</p>)}</article>
        <p><Badge icon="users">{t.banner.title}</Badge></p>
      </Section>
    </>
  );
}
