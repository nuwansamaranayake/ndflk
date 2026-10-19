import "@/styles/globals.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { isLocale, locales, htmlLang, type Locale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { RevivalBanner, SiteHeader, SiteFooter } from "@/components/Chrome";
import Reveal from "@/components/Reveal";
import BackToTop from "@/components/BackToTop";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getContent(locale);
  return {
    metadataBase: new URL(process.env.SITE_URL || "https://ndflk.org"),
    icons: { icon: [{ url: "/logo/favicon-32.png", sizes: "32x32" }, { url: "/logo/favicon-16.png", sizes: "16x16" }], apple: "/logo/apple-touch-icon-180.png" },
    manifest: "/manifest.webmanifest",
    title: { default: t.meta.siteName, template: `%s | ${t.meta.siteShort}` },
    description: t.meta.description,
    openGraph: { siteName: t.meta.siteName, images: ["/img/hero-tank.jpg"], locale: locale === "si" ? "si_LK" : "en_GB", type: "website" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getContent(locale as Locale);
  const h = await headers();
  const path = h.get("x-ndf-path") || `/${locale}`;
  return (
    <html lang={htmlLang[locale]}>
      <head>
        <link rel="alternate" hrefLang="en" href={`/en${path.replace(/^\/(en|si)/, "")}`} />
        <link rel="alternate" hrefLang="si" href={`/si${path.replace(/^\/(en|si)/, "")}`} />
        <link rel="alternate" hrefLang="x-default" href={`/en${path.replace(/^\/(en|si)/, "")}`} />
        {locale === "si" ? <link rel="preload" href="/fonts/NotoSansSinhala-sinhala.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /> : <link rel="preload" href="/fonts/AtkinsonHyperlegibleNext-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
      </head>
      <body>
        <a href="#main" className="ndf-skip-link">{t.nav.skip}</a>
        <RevivalBanner t={t} locale={locale} />
        <SiteHeader t={t} locale={locale} path={path} />
        {locale === "si" ? (
          <div className="ndf-container" style={{ paddingTop: "0.75rem" }}>
            <p className="ndf-machine" style={{ margin: 0 }}>{t.common.draftLabel}: {t.common.translationNotice}</p>
          </div>
        ) : null}
        <main id="main">{children}</main>
        <SiteFooter t={t} locale={locale} />
        <Reveal />
        <BackToTop label={t.common.scrollTop} />
      </body>
    </html>
  );
}
