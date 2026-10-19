import type { Metadata } from "next";
import Link from "next/link";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Section, Callout } from "@/components/Chrome";
import { MessageForm } from "@/components/Forms";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/contact", t.contact.title, t.contact.lede);
}

export default async function Contact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t, L } = await loadPage(params);
  const k = t.contact; const c = t.common;
  return (
    <>
      <PageHead eyebrow={k.eyebrow} title={k.title} lede={k.lede} />
      <Section>
        <div className="ndf-split" style={{ alignItems: "start" }}>
          <div>
            <h2>{k.formTitle}</h2>
            <MessageForm kind="contact" locale={locale} subjects={k.subjects} labels={{ name: k.fields.name, email: k.fields.email, phone: k.fields.phone, subject: k.fields.subject, message: k.fields.message, required: c.required, optional: c.optional, send: c.send, sending: c.sending, sent: c.sent, sendError: c.sendError, emailFormat: c.emailFormat, phoneFormat: c.phoneFormat, consent: c.consent, consentRequired: c.consentRequired }} />
          </div>
          <div className="ndf-stack">
            <Callout kind="info"><p>{k.intro}</p></Callout>
            <p className="ndf-card__meta">{k.privacyNote} <Link href={L("/legal/privacy")}>{t.nav.privacy}</Link></p>
          </div>
        </div>
      </Section>
    </>
  );
}
