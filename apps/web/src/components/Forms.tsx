"use client";
import { useState, type FormEvent } from "react";
import Icon from "./Icon";

type Labels = {
  name: string; email: string; phone?: string; subject?: string; message: string; place?: string; role?: string; description?: string; file?: string;
  required: string; optional: string; send: string; sending: string; sent: string; sendError: string; emailFormat: string; phoneFormat: string;
  consent: string; consentRequired: string; fileTooLarge?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^(\+94\s?7\d{8}|\+94\s?7\d\s?\d{3}\s?\d{4}|07\d{8}|07\d\s?\d{3}\s?\d{4}|07\d\s?\d{7})$/;

function Field({ id, label, hint, error, required, children }: { id: string; label: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="ndf-field">
      <label className="ndf-field__label" htmlFor={id}>{label}{required ? " *" : ""}</label>
      {hint ? <span className="ndf-field__hint" id={`${id}-hint`}>{hint}</span> : null}
      {children}
      {error ? <span className="ndf-field__error" id={`${id}-err`} role="alert"><Icon name="circle-x" />{error}</span> : null}
    </div>
  );
}

export function MessageForm({ kind, locale, labels, subjects, roles, withFile = false, endpoint = "/api/contact", consentVersion = "2026-10-19" }:
  { kind: string; locale: string; labels: Labels; subjects?: string[]; roles?: { value: string; label: string }[]; withFile?: boolean; endpoint?: string; consentVersion?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errText, setErrText] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const errs: Record<string, string> = {};
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    if (!String(fd.get("name") || "").trim()) errs.name = labels.required;
    if (!EMAIL.test(email)) errs.email = labels.emailFormat;
    if (phone && !PHONE.test(phone.replace(/\s+/g, " "))) errs.phone = labels.phoneFormat;
    if (!String(fd.get("message") || "").trim()) errs.message = labels.required;
    if (!fd.get("consent")) errs.consent = labels.consentRequired;
    const file = fd.get("file");
    if (file instanceof File && file.size > 10 * 1024 * 1024) errs.file = labels.fileTooLarge || labels.required;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("sending");
    try {
      fd.set("kind", kind); fd.set("locale", locale); fd.set("consent_version", consentVersion);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      if (res.status === 202) { setState("sent"); form.reset(); }
      else { const j = await res.json().catch(() => ({})); setErrText(j.error || `${res.status}`); setState("error"); }
    } catch { setState("error"); }
  }

  if (state === "sent") return <div className="ndf-callout ndf-callout--success" role="status"><span className="ndf-callout__icon"><Icon name="circle-check" /></span><div className="ndf-callout__body"><p className="ndf-callout__title">{labels.sent}</p></div></div>;

  return (
    <form className="ndf-form" onSubmit={onSubmit} noValidate encType="multipart/form-data">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="ndf-visually-hidden" aria-hidden="true" />
      <div className="ndf-form__row">
        <Field id="f-name" label={labels.name} required error={errors.name}><input id="f-name" name="name" className="ndf-input" autoComplete="name" aria-invalid={!!errors.name} /></Field>
        <Field id="f-email" label={labels.email} required error={errors.email}><input id="f-email" name="email" type="email" className="ndf-input" autoComplete="email" aria-invalid={!!errors.email} /></Field>
      </div>
      <div className="ndf-form__row">
        {labels.phone ? <Field id="f-phone" label={labels.phone} hint="+94 7X XXX XXXX" error={errors.phone}><input id="f-phone" name="phone" type="tel" className="ndf-input" autoComplete="tel" aria-invalid={!!errors.phone} /></Field> : null}
        {labels.place ? <Field id="f-place" label={labels.place}><input id="f-place" name="place" className="ndf-input" /></Field> : null}
      </div>
      {roles ? <Field id="f-role" label={labels.role || ""}><select id="f-role" name="role" className="ndf-select" defaultValue={kind}>{roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></Field> : null}
      {subjects ? <Field id="f-subject" label={labels.subject || ""}><select id="f-subject" name="subject" className="ndf-select">{subjects.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field> : null}
      <Field id="f-message" label={labels.description || labels.message} required error={errors.message}><textarea id="f-message" name="message" className="ndf-input" rows={6} aria-invalid={!!errors.message} /></Field>
      {withFile ? <Field id="f-file" label={labels.file || ""} error={errors.file}><input id="f-file" name="file" type="file" className="ndf-input" accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff,.doc,.docx" /></Field> : null}
      <div>
        <label className="ndf-check"><input type="checkbox" name="consent" className="ndf-check__box" aria-invalid={!!errors.consent} /><span>{labels.consent}</span></label>
        {errors.consent ? <span className="ndf-field__error" role="alert"><Icon name="circle-x" />{errors.consent}</span> : null}
      </div>
      {state === "error" ? <div className="ndf-callout ndf-callout--error" role="alert"><span className="ndf-callout__icon"><Icon name="circle-x" /></span><div className="ndf-callout__body"><p className="ndf-callout__title">{labels.sendError}</p>{errText ? <p>{errText}</p> : null}</div></div> : null}
      <div className="ndf-form__actions">
        <button type="submit" className="ndf-btn ndf-btn--primary" disabled={state === "sending"}>{state === "sending" ? labels.sending : labels.send}</button>
      </div>
    </form>
  );
}

export function NewsletterForm({ locale, labels }: { locale: string; labels: { email: string; cta: string; done: string; error: string; emailFormat: string; consent: string; sending: string } }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    if (!EMAIL.test(email)) { setErr(labels.emailFormat); return; }
    if (!fd.get("consent")) { setErr(labels.consent); return; }
    setErr(""); setState("sending");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, locale, consent_version: "2026-10-19", website: fd.get("website") || "" }) });
      setState(res.status === 202 ? "sent" : "error");
    } catch { setState("error"); }
  }
  if (state === "sent") return <p role="status" className="ndf-callout ndf-callout--success"><Icon name="circle-check" /> {labels.done}</p>;
  return (
    <form onSubmit={onSubmit} noValidate className="ndf-stack">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="ndf-visually-hidden" aria-hidden="true" />
      <div className="ndf-search">
        <label className="ndf-visually-hidden" htmlFor="nl-email">{labels.email}</label>
        <input id="nl-email" name="email" type="email" className="ndf-input" placeholder={labels.email} autoComplete="email" />
        <button type="submit" className="ndf-btn ndf-btn--primary" disabled={state === "sending"}>{state === "sending" ? labels.sending : labels.cta}</button>
      </div>
      <label className="ndf-check"><input type="checkbox" name="consent" className="ndf-check__box" /><span style={{ fontSize: "var(--text-sm)" }}>{labels.consent}</span></label>
      {err ? <span className="ndf-field__error" role="alert"><Icon name="circle-x" />{err}</span> : null}
      {state === "error" ? <span className="ndf-field__error" role="alert"><Icon name="circle-x" />{labels.error}</span> : null}
    </form>
  );
}
