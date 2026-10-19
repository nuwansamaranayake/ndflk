import type { Metadata } from "next";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Section, Figure } from "@/components/Chrome";
import Icon from "@/components/Icon";
import { MessageForm } from "@/components/Forms";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/get-involved", t.getInvolved.title, t.getInvolved.lede, "farmer-society.jpg");
}

export default async function GetInvolved({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t } = await loadPage(params);
  const g = t.getInvolved; const c = t.common;
  return (
    <>
      <PageHead eyebrow={g.eyebrow} title={g.title} lede={g.lede} />
      <Section>
        <div className="ndf-grid ndf-grid--3">
          {g.groups.map((x) => (
            <article key={x.kind} className="ndf-card ndf-reveal">
              <h2 className="ndf-card__title">{x.title}</h2>
              <p className="ndf-card__body">{x.text}</p>
              <a href={`#form`} className="ndf-link ndf-link--standalone">{x.cta} <Icon name="arrow-right" /></a>
            </article>
          ))}
        </div>
      </Section>
      <Section variant="sunken" id="form">
        <div className="ndf-split" style={{ alignItems: "start" }}>
          <div>
            <h2>{g.formTitle}</h2>
            <MessageForm kind="volunteer" locale={locale} roles={g.groups.map((x) => ({ value: x.kind, label: x.title }))} labels={{ name: g.fields.name, email: g.fields.email, phone: g.fields.phone, message: g.fields.message, place: g.fields.place, role: g.fields.role, required: c.required, optional: c.optional, send: c.send, sending: c.sending, sent: c.sent, sendError: c.sendError, emailFormat: c.emailFormat, phoneFormat: c.phoneFormat, consent: c.consent, consentRequired: c.consentRequired }} />
          </div>
          <Figure src="leaders.jpg" alt="" caption={c.illustration} />
        </div>
      </Section>
    </>
  );
}
