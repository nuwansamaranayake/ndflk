import "server-only";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./i18n";
import { getContent, type Content } from "./content";

export async function loadPage(params: Promise<{ locale: string } & Record<string, string>>) {
  const p = await params;
  if (!isLocale(p.locale)) notFound();
  const locale = p.locale as Locale;
  return { locale, t: getContent(locale), params: p, L: (path: string) => `/${locale}${path}` };
}

export function pageMeta(locale: Locale, path: string, title: string, description?: string, image?: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `/${locale}${path}`, languages: { en: `/en${path}`, si: `/si${path}` } },
    openGraph: image ? { images: [`/img/${image}`] } : undefined,
  };
}
export type { Content };
