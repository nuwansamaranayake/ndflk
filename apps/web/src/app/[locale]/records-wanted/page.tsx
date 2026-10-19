import type { Metadata } from "next";
import { loadPage, pageMeta } from "@/lib/page";
import { PageHead, Section, Figure, Callout } from "@/components/Chrome";
import { MessageForm } from "@/components/Forms";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await loadPage(params);
  return pageMeta(locale, "/records-wanted", t.recordsWanted.title, t.recordsWanted.lede, "records.jpg");
}

export default async function RecordsWanted({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t } = await loadPage(params);
  const r = t.recordsWanted; const c = t.common;
  return (
    <>
      <PageHead eyebrow={r.eyebrow} title={r.title} lede={r.lede} />
      <Section>
        <div className="ndf-split" style={{ alignItems: "start" }}>
          <div className="ndf-prose">
            <p className="ndf-section__lede">{r.intro}</p>
            <ol>{r.items.map((it, i) => <li key={i}>{it}</li>)}</ol>
          </div>
          <Figure src="records.jpg" alt="" caption={c.illustration} />
        </div>
      </Section>
      <Section variant="sunken">
        <Callout kind="records" title={r.howTitle}><p>{r.how}</p></Callout>
        <h2 style={{ marginTop: "2rem" }}>{r.formTitle}</h2>
        <MessageForm kind="records_offer" locale={locale} withFile endpoint="/api/records-offer" labels={{ name: r.fields.name, email: r.fields.email, phone: r.fields.phone, message: r.fields.description, description: r.fields.description, file: r.fields.file, required: c.required, optional: c.optional, send: c.send, sending: c.sending, sent: c.sent, sendError: c.sendError, emailFormat: c.emailFormat, phoneFormat: c.phoneFormat, consent: c.consent, consentRequired: c.consentRequired, fileTooLarge: r.fileTooLarge }} />
      </Section>
    </>
  );
}
