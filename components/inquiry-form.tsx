"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Mail, MessageCircle } from "lucide-react";
import {
  buildInquiryMessage,
  buildWhatsAppUrl,
  inquirySchema,
  type Inquiry,
} from "@/lib/contact-inquiry";
import {
  clearInquiryDraft,
  readInquiryDraft,
  writeInquiryDraft,
} from "@/lib/inquiry-draft-repository";
import { WhatsAppMark } from "@/components/whatsapp-mark";
import { GmailMark } from "@/components/gmail-mark";

const empty: Inquiry = { date: "", comuna: "", operator: "", delivery: "", comment: "" };
type Field = keyof Inquiry;

export function InquiryForm({
  subject,
  phone,
  email = "",
  draftKey,
  demo = false,
  kind = "item",
}: {
  subject: string;
  phone?: string;
  email?: string;
  draftKey: string;
  demo?: boolean;
  kind?: "item" | "provider";
}) {
  const id = useId();
  const [values, setValues] = useState<Inquiry>(empty);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [restored, setRestored] = useState(false);
  const parsed = inquirySchema.safeParse(values);
  const errors = parsed.success
    ? {}
    : (Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path[0], issue.message]),
      ) as Partial<Record<Field, string>>);
  const message = parsed.success ? buildInquiryMessage(subject, parsed.data, kind) : "";
  const url = !demo && message ? buildWhatsAppUrl(phone || "", message) : null;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
  const mailtoUrl =
    !demo && message && validEmail
      ? `mailto:${encodeURIComponent(validEmail)}?subject=${encodeURIComponent(`Consulta por ${subject}`)}&body=${encodeURIComponent(message)}`
      : null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const previous = readInquiryDraft(draftKey);
      if (previous) setValues(previous);
      setRestored(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [draftKey]);
  useEffect(() => {
    if (!restored || ready) return;
    const timer = window.setTimeout(() => {
      if (!writeInquiryDraft(draftKey, values)) setStorageError(true);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [draftKey, restored, values, ready]);

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setReady(false);
    setStorageError(false);
  }
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ date: true, comuna: true, operator: true, delivery: true, comment: true });
    if (parsed.success) {
      if (!writeInquiryDraft(draftKey, parsed.data)) setStorageError(true);
      setReady(true);
    }
  }
  function issue(field: Field) {
    return touched[field] && errors[field] ? (
      <p id={`${id}-${field}-error`} className="mt-1 text-xs text-[#f1b4a4]">
        {errors[field]}
      </p>
    ) : null;
  }
  const fieldState = (field: Field) => ({
    "aria-invalid": Boolean(touched[field] && errors[field]) as true | false,
    "aria-describedby": touched[field] && errors[field] ? `${id}-${field}-error` : undefined,
  });

  return (
    <form onSubmit={prepare} noValidate className="mt-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Fecha aproximada <span className="font-normal text-[#a8b8a7]">(opcional)</span>
          <input
            type="date"
            value={values.date}
            onChange={(event) => update("date", event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, date: true }))}
            {...fieldState("date")}
            className="field mt-2"
          />
          {issue("date")}
        </label>
        <label className="block text-sm font-semibold">
          Comuna del trabajo <span className="font-normal text-[#a8b8a7]">(opcional)</span>
          <input
            value={values.comuna}
            onChange={(event) => update("comuna", event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, comuna: true }))}
            maxLength={80}
            placeholder="Ej. Maipú"
            {...fieldState("comuna")}
            className="field mt-2"
          />
          {issue("comuna")}
        </label>
        <label className="block text-sm font-semibold">
          ¿Necesitas operador? <span className="font-normal text-[#a8b8a7]">(opcional)</span>
          <select
            value={values.operator}
            onChange={(event) => update("operator", event.target.value)}
            className="field mt-2"
          >
            <option value="">Aún no lo sé</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          ¿Necesitas traslado? <span className="font-normal text-[#a8b8a7]">(opcional)</span>
          <select
            value={values.delivery}
            onChange={(event) => update("delivery", event.target.value)}
            className="field mt-2"
          >
            <option value="">Aún no lo sé</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="block text-sm font-semibold sm:col-span-2">
          Tu consulta <span className="font-normal text-[#a8b8a7]">(opcional)</span>
          <textarea
            value={values.comment}
            onChange={(event) => update("comment", event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, comment: true }))}
            maxLength={500}
            rows={3}
            placeholder="Ej. Necesito hacer una zanja de 20 metros."
            {...fieldState("comment")}
            className="field mt-2 resize-y"
          />
          {issue("comment")}
          <span className="mt-1 block text-right text-xs font-normal text-[#a8b8a7]">
            {values.comment.length}/500
          </span>
        </label>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[#b7c8b4]">
        Puedes continuar sin completar los campos opcionales. La conversación y el acuerdo se harán
        directamente con el proveedor.
      </p>
      {storageError ? (
        <p role="status" className="mt-3 text-xs text-[#e9bd9e]">
          No pudimos conservar esta consulta en el navegador. Puedes continuar sin problema.
        </p>
      ) : null}
      <button type="submit" className="action-primary mt-6 min-w-[200px] text-sm">
        <MessageCircle size={17} /> Preparar consulta
      </button>
      {ready && parsed.success ? (
        <div
          className="mt-7 rounded-2xl border border-[#70876a] bg-[#202c23] p-5 md:p-6"
          role="status"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-[#d8e9cc]">
            <Check size={17} /> Mensaje listo para revisar
          </p>
          <pre className="mt-4 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-[#d0ded0]">
            {message}
          </pre>
          {demo ? (
            <p className="mt-5 text-xs text-[#adbdac]">
              Esta ficha es un ejemplo. No se abrirá ningún contacto real.
            </p>
          ) : url || mailtoUrl ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => clearInquiryDraft(draftKey)}
                  className="action-primary text-sm"
                >
                  <WhatsAppMark className="size-[18px]" /> Continuar por WhatsApp{" "}
                  <ArrowUpRight size={17} />
                </a>
              )}
              {mailtoUrl && (
                <a
                  href={mailtoUrl}
                  onClick={() => clearInquiryDraft(draftKey)}
                  className="action-secondary text-sm"
                >
                  {validEmail.toLowerCase().endsWith("@gmail.com") ? (
                    <GmailMark className="size-[19px]" />
                  ) : (
                    <Mail size={19} />
                  )}
                  Continuar por correo <ArrowUpRight size={17} />
                </a>
              )}
            </div>
          ) : (
            <p role="alert" className="mt-5 text-sm text-[#f1b4a4]">
              No pudimos abrir el contacto de este proveedor.
            </p>
          )}
          {mailtoUrl && (
            <p className="mt-3 break-all text-xs text-[#bdcdb6]">
              Correo del proveedor: {validEmail}
            </p>
          )}
          <p className="mt-4 text-xs text-[#a8b8a7]">
            Podrás revisar y modificar el mensaje en tu aplicación antes de enviarlo. Maqvia no lo
            envía por ti.
          </p>
        </div>
      ) : null}
    </form>
  );
}
