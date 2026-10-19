import type { Metadata } from "next";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Cite, Section, Callout, Badge } from "@/components/Chrome";
import { MessageForm } from "@/components/Forms";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/about/upali", t.upali.title, t.upali.lede);
}

export default async function Upali({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t } = await loadPage(params);
  const u = t.upali; const c = t.common;
  return (
    <>
      <PageHead eyebrow={u.eyebrow} title={u.title} lede={u.lede} />
      <Section>
        <p className="ndf-section__lede ndf-prose">{u.intro}</p>
        <div className="ndf-grid ndf-grid--2">
          <div>
            <h2>{u.factsTitle}</h2>
            <ul className="ndf-prose">{u.facts.map((f, i) => <li key={i}>{f.text} {f.ref ? <Cite id={f.ref} locale={locale} /> : <Badge kind="info">{c.verified}</Badge>}</li>)}</ul>
            <p className="ndf-card__meta">{u.spelling}</p>
          </div>
          <div>
            <Callout kind="records" title={u.familyTitle} icon="users"><p>{u.familyText}</p><p><Badge kind="info">{c.family}</Badge></p></Callout>
          </div>
        </div>
      </Section>
      <Section variant="sunken">
        <h2>{u.memoriesTitle}</h2>
        <p className="ndf-prose">{u.memoriesText}</p>
        <MessageForm kind="memory" locale={locale} labels={{ name: t.contact.fields.name, email: t.contact.fields.email, phone: t.contact.fields.phone, message: t.contact.fields.message, required: c.required, optional: c.optional, send: c.send, sending: c.sending, sent: c.sent, sendError: c.sendError, emailFormat: c.emailFormat, phoneFormat: c.phoneFormat, consent: c.consent, consentRequired: c.consentRequired }} />
      </Section>
    </>
  );
}
