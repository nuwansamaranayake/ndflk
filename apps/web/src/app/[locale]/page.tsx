import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { Cite, Callout, Section, Figure } from "@/components/Chrome";
import Icon from "@/components/Icon";
import Counter from "@/components/Counter";
import { NewsletterForm } from "@/components/Forms";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getContent(locale);
  return { title: { absolute: `${t.meta.siteName} (NDF), Sri Lanka` }, description: t.meta.description, alternates: { canonical: `/${locale}`, languages: { en: "/en", si: "/si" } } };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getContent(locale as Locale);
  const h = t.home;
  const L = (p: string) => `/${locale}${p}`;
  return (
    <>
      <section className="ndf-hero">
        <div className="ndf-container ndf-hero__inner">
          <div>
            <p className="ndf-hero__eyebrow">{h.eyebrow}</p>
            <h1 className="ndf-hero__title">{h.title}</h1>
            <p className="ndf-hero__lede">{h.lede}</p>
            <div className="ndf-hero__actions">
              <Link href={L("/about/story")} className="ndf-btn ndf-btn--inverse">{h.ctaStory} <Icon name="arrow-right" /></Link>
              <Link href={L("/programmes")} className="ndf-btn ndf-btn--outline-inverse">{h.ctaProgrammes}</Link>
              <Link href={L("/get-involved")} className="ndf-btn ndf-btn--outline-inverse">{h.ctaInvolved}</Link>
            </div>
          </div>
          <div className="ndf-hero__media">
            <Image src="/img/hero-tank.jpg" alt="" width={1600} height={1195} priority sizes="(max-width: 64em) 100vw, 45vw" />
            <span className="ndf-figcap"><Icon name="image" /> {t.common.illustration}</span>
          </div>
        </div>
      </section>

      <Section>
        <div className="ndf-section__head">
          <p className="ndf-section__eyebrow">{h.proofEyebrow}</p>
          <h2>{h.proofTitle}</h2>
        </div>
        <div className="ndf-proof">
          {h.proof.map((p, i) => (
            <div key={i} className="ndf-stat ndf-reveal">
              <span className="ndf-stat__value"><Counter value={p.value} /></span>
              <span className="ndf-stat__label">{p.label}</span>
              <span className="ndf-stat__ref"><Cite id={p.ref} locale={locale} /></span>
            </div>
          ))}
        </div>
      </Section>

      <Section variant="sunken">
        <p className="ndf-section__eyebrow">{h.routesEyebrow}</p>
        <div className="ndf-grid ndf-grid--3">
          {h.routes.map((r) => (
            <article key={r.href} className="ndf-card ndf-card--link ndf-reveal">
              <div className="ndf-card__img"><Image src={`/img/${r.img.replace(".jpg", "-800.jpg")}`} alt="" width={800} height={450} sizes="(max-width: 48em) 100vw, 33vw" /></div>
              <h3 className="ndf-card__title"><Link href={L(r.href)}>{r.title}</Link></h3>
              <p className="ndf-card__body">{r.text}</p>
              <p className="ndf-card__meta"><Icon name="image" /> {t.common.illustration}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="ndf-split">
          <div className="ndf-reveal">
            <p className="ndf-section__eyebrow">{h.approachEyebrow}</p>
            <h2>{h.approachTitle}</h2>
            <p>{h.approachText} <Cite id={h.approachRef} locale={locale} /></p>
            <Link href={L("/about/approach")} className="ndf-link ndf-link--standalone">{h.approachLink} <Icon name="arrow-right" /></Link>
          </div>
          <div className="ndf-reveal"><Figure src="farmer-society.jpg" alt="" caption={t.common.illustration} /></div>
        </div>
      </Section>

      <Section variant="brand">
        <div className="ndf-split">
          <div className="ndf-reveal"><Figure src="tank-work.jpg" alt="" caption={t.common.illustration} /></div>
          <div className="ndf-reveal">
            <p className="ndf-section__eyebrow">{h.flagshipEyebrow}</p>
            <h2>{h.flagshipTitle}</h2>
            <p>{h.flagshipText}</p>
            <Link href={L("/programmes/tank-renovation")} className="ndf-btn ndf-btn--inverse">{h.flagshipLink} <Icon name="arrow-right" /></Link>
          </div>
        </div>
      </Section>

      <Section>
        <div className="ndf-split">
          <div className="ndf-reveal">
            <p className="ndf-section__eyebrow">{h.revivalEyebrow}</p>
            <h2>{h.revivalTitle}</h2>
            <p>{h.revivalText}</p>
            <Link href={L("/news/2026-10-revival-and-website")} className="ndf-link ndf-link--standalone">{h.revivalLink} <Icon name="arrow-right" /></Link>
          </div>
          <div className="ndf-reveal"><Figure src="revival.jpg" alt="" caption={t.common.illustration} /></div>
        </div>
      </Section>

      <Section variant="sunken">
        <div className="ndf-grid ndf-grid--2">
          <div className="ndf-reveal">
            <Callout kind="records" title={h.recordsTitle}>
              <p>{h.recordsText}</p>
              <div className="ndf-callout__actions">
                <Link href={L("/records-wanted")} className="ndf-btn ndf-btn--clay">{t.common.tellUs} <Icon name="arrow-right" /></Link>
              </div>
            </Callout>
          </div>
          <div className="ndf-card ndf-reveal">
            <p className="ndf-card__eyebrow">{h.libraryEyebrow}</p>
            <h3 className="ndf-card__title">{h.libraryTitle}</h3>
            <p className="ndf-card__body">{h.libraryText}</p>
            <Link href={L("/library")} className="ndf-link ndf-link--standalone">{h.libraryLink} <Icon name="arrow-right" /></Link>
          </div>
        </div>
      </Section>

      <Section>
        <div className="ndf-split">
          <div>
            <h2>{h.newsletterTitle}</h2>
            <p>{h.newsletterText}</p>
          </div>
          <NewsletterForm locale={locale} labels={{ email: h.newsletterEmail, cta: h.newsletterCta, done: h.newsletterDone, error: t.common.sendError, emailFormat: t.common.emailFormat, consent: t.common.consent, sending: t.common.sending }} />
        </div>
      </Section>
    </>
  );
}
