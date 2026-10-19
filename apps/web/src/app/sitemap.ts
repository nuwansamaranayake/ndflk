import type { MetadataRoute } from "next";
import { enContent } from "@/lib/content";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || "https://ndflk.org";
  const paths = ["", "/about/story", "/about/approach", "/about/governance", "/about/constitution", "/about/legal", "/about/upali", "/programmes", "/programmes/tank-renovation",
    ...enContent.programmes.pages.filter((p) => p.slug !== "tank-renovation").map((p) => `/programmes/${p.slug}`),
    "/library", ...Object.keys(enContent.docs).map((id) => `/library/${id}`), "/get-involved", "/records-wanted", "/news", ...enContent.news.posts.map((p) => `/news/${p.slug}`), "/contact", "/legal/privacy", "/legal/terms"];
  return paths.flatMap((p) => (["en", "si"] as const).map((l) => ({ url: `${base}/${l}${p}`, lastModified: new Date("2026-10-19"), alternates: { languages: { en: `${base}/en${p}`, si: `${base}/si${p}` } } })));
}
