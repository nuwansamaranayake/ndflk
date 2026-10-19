import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Content } from "@/lib/content";
import Icon from "./Icon";
import NavToggle from "./NavToggle";

export function RevivalBanner({ t, locale }: { t: Content; locale: Locale }) {
  return (
    <div className="ndf-revival" role="status">
      <div className="ndf-container ndf-revival__inner">
        <span className="ndf-revival__title"><Icon name="circle-dashed" /> {t.banner.title}</span>
        <span>{t.banner.text}</span>
        <Link href={`/${locale}/get-involved`} className="ndf-link">{t.banner.link} <Icon name="arrow-right" /></Link>
      </div>
    </div>
  );
}

export function SiteHeader({ t, locale, path }: { t: Content; locale: Locale; path: string }) {
  const nav = [
    { href: `/${locale}/about/story`, label: t.nav.about, match: `/${locale}/about` },
    { href: `/${locale}/programmes`, label: t.nav.programmes, match: `/${locale}/programmes` },
    { href: `/${locale}/library`, label: t.nav.library, match: `/${locale}/library` },
    { href: `/${locale}/news`, label: t.nav.news, match: `/${locale}/news` },
    { href: `/${locale}/get-involved`, label: t.nav.getInvolved, match: `/${locale}/get-involved` },
    { href: `/${locale}/contact`, label: t.nav.contact, match: `/${locale}/contact` },
  ];
  const other: Locale = locale === "en" ? "si" : "en";
  const rest = path.replace(/^\/(en|si)/, "") || "";
  return (
    <header className="ndf-header">
      <div className="ndf-container ndf-header__inner">
        <Link href={`/${locale}`} className="ndf-header__brand" aria-label={t.meta.siteName}>
          <span className="ndf-logo">
            <Image src="/logo/ndf-mark-black-128.png" alt="" width={44} height={41} className="ndf-logo__mark" priority />
            <span className="ndf-logo__text">
              <span className="ndf-logo__ndf">NDF</span>
              <span className="ndf-logo__desc" lang={locale === "si" ? "si" : undefined}>{locale === "si" ? t.meta.siteNameLocal : t.meta.siteName}</span>
            </span>
          </span>
        </Link>
        <div className="ndf-header__tools">
          <nav className="ndf-lang" aria-label={t.nav.language}>
            <Link href={`/en${rest}`} aria-current={locale === "en" ? "true" : undefined} lang="en"><span className="ndf-lang__code">EN</span></Link>
            <Link href={`/si${rest}`} aria-current={locale === "si" ? "true" : undefined} lang="si"><span className="ndf-lang__code">සිං</span></Link>
          </nav>
          <NavToggle label={t.nav.menu} closeLabel={t.nav.close} />
        </div>
        <nav className="ndf-header__nav" id="site-nav" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path.startsWith(n.match) ? "page" : undefined}>{n.label}</Link>
          ))}
        </nav>
      </div>
      {void other}
    </header>
  );
}

export function SiteFooter({ t, locale }: { t: Content; locale: Locale }) {
  const L = (p: string) => `/${locale}${p}`;
  return (
    <footer className="ndf-footer ndf-inverse">
      <div className="ndf-container">
        <div className="ndf-footer__grid">
          <div>
            <Image src="/logo/ndf-logo-white-480.png" alt={t.meta.siteName} width={240} height={162} style={{ height: "auto", maxWidth: "15rem" }} />
            <p className="ndf-footer__muted" style={{ marginTop: "1rem" }}>{t.footer.about}</p>
          </div>
          <div>
            <p className="ndf-footer__name">{t.footer.explore}</p>
            <ul className="ndf-footer__list">
              <li><Link href={L("/about/story")}>{t.nav.story}</Link></li>
              <li><Link href={L("/about/approach")}>{t.nav.approach}</Link></li>
              <li><Link href={L("/about/governance")}>{t.nav.governance}</Link></li>
              <li><Link href={L("/about/constitution")}>{t.nav.constitution}</Link></li>
              <li><Link href={L("/about/legal")}>{t.nav.legal}</Link></li>
              <li><Link href={L("/about/upali")}>{t.nav.upali}</Link></li>
              <li><Link href={L("/programmes")}>{t.nav.programmes}</Link></li>
              <li><Link href={L("/library")}>{t.nav.library}</Link></li>
            </ul>
          </div>
          <div>
            <p className="ndf-footer__name">{t.footer.takePart}</p>
            <ul className="ndf-footer__list">
              <li><Link href={L("/get-involved")}>{t.nav.getInvolved}</Link></li>
              <li><Link href={L("/records-wanted")}>{t.nav.recordsWanted}</Link></li>
              <li><Link href={L("/news")}>{t.nav.news}</Link></li>
              <li><Link href={L("/contact")}>{t.nav.contact}</Link></li>
            </ul>
            <p className="ndf-footer__name" style={{ marginTop: "1rem" }}>{t.footer.legal}</p>
            <ul className="ndf-footer__list">
              <li><Link href={L("/legal/privacy")}>{t.nav.privacy}</Link></li>
              <li><Link href={L("/legal/terms")}>{t.nav.terms}</Link></li>
            </ul>
          </div>
        </div>
        <div className="ndf-footer__base">
          <span>{t.footer.copyright}</span>
          <span>{t.footer.illustrationNote}</span>
          <a href="https://github.com/nuwansamaranayake/ndflk" rel="noopener">{t.footer.builtWith} <Icon name="external-link" /></a>
        </div>
      </div>
    </footer>
  );
}

export function PageHead({ eyebrow, title, lede, lang }: { eyebrow?: string; title: string; lede?: string; lang?: string }) {
  return (
    <div className="ndf-pagehead">
      <div className="ndf-container">
        {eyebrow ? <p className="ndf-pagehead__eyebrow">{eyebrow}</p> : null}
        <h1 className="ndf-pagehead__title" lang={lang}>{title}</h1>
        {lede ? <p className="ndf-pagehead__lede">{lede}</p> : null}
      </div>
    </div>
  );
}

export function Cite({ id, locale }: { id: string; locale: Locale }) {
  if (!id) return null;
  return <Link href={`/${locale}/library/${id}`} className="ndf-cite" title={id}><Icon name="file-text" />{id}</Link>;
}

export function Callout({ kind = "info", title, children, icon }: { kind?: "info" | "success" | "warning" | "error" | "records" | "neutral"; title?: string; children: React.ReactNode; icon?: string }) {
  const ic = icon ?? ({ info: "info", success: "circle-check", warning: "triangle-alert", error: "circle-x", records: "archive", neutral: "info" } as Record<string, string>)[kind];
  return (
    <div className={`ndf-callout ${kind === "neutral" ? "" : `ndf-callout--${kind}`}`}>
      <span className="ndf-callout__icon"><Icon name={ic} /></span>
      <div className="ndf-callout__body">
        {title ? <p className="ndf-callout__title">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}

export function Figure({ src, alt, caption, cover = true, priority = false, sizes = "(max-width: 64em) 100vw, 50vw" }: { src: string; alt: string; caption: string; cover?: boolean; priority?: boolean; sizes?: string }) {
  return (
    <figure className={`ndf-figure ${cover ? "ndf-figure--cover" : ""}`}>
      <Image src={`/img/${src}`} alt={alt} width={1600} height={900} sizes={sizes} priority={priority} style={{ width: "100%", height: "auto" }} />
      <figcaption className="ndf-figure__cap"><Icon name="image" /> {caption}</figcaption>
    </figure>
  );
}

export function Badge({ kind = "neutral", children, icon }: { kind?: "neutral" | "success" | "warning" | "error" | "info"; children: React.ReactNode; icon?: string }) {
  return <span className={`ndf-badge ${kind === "neutral" ? "" : `ndf-badge--${kind}`}`}>{icon ? <Icon name={icon} /> : null}{children}</span>;
}

export function Section({ children, variant, id, className = "" }: { children: React.ReactNode; variant?: "sunken" | "brand"; id?: string; className?: string }) {
  return (
    <section id={id} className={`ndf-section ${variant ? `ndf-section--${variant}` : ""} ${className}`}>
      <div className="ndf-container">{children}</div>
    </section>
  );
}
