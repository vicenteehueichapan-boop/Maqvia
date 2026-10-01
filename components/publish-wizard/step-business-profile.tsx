import { Mail } from "lucide-react";
import { GmailMark } from "@/components/gmail-mark";
import { type StepProps } from "./types";
import { communes } from "@/lib/publish-constants";

export function StepBusinessProfile({ values, update, mark, fieldState, issue }: StepProps) {
  return (
    <section data-publish-step="0" className="rounded-[26px] premium-panel p-5 md:p-8">
      <div className="flex items-start gap-4 mb-7">
        <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-[#b9d88b1b] text-[#b9d88b] font-bold">
          01
        </span>
        <div>
          <p className="eyebrow">Identidad de tu negocio</p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-.04em]">Tu perfil de proveedor</h2>
          <p className="mt-1 text-sm text-[#a9b7a6]">Estos datos construirán tu vitrina pública.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block text-sm font-semibold">
          Nombre comercial *
          <input
            name="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            onBlur={() => mark("name")}
            maxLength={90}
            placeholder="Ej. Andes Maquinarias"
            {...fieldState("name")}
            className="field mt-2"
          />
          {issue("name")}
        </label>
        <label className="block text-sm font-semibold">
          WhatsApp de contacto *
          <input
            name="whatsapp"
            value={values.whatsapp}
            onChange={(event) => update("whatsapp", event.target.value)}
            onBlur={() => mark("whatsapp")}
            type="tel"
            inputMode="tel"
            placeholder="+56 9 1234 5678"
            {...fieldState("whatsapp")}
            className="field mt-2"
          />
          {issue("whatsapp")}
          <span className="mt-1.5 block text-xs font-normal text-[#94a391]">
            Solo visible para usuarios con sesión iniciada.
          </span>
        </label>
        <div className="md:col-span-2 rounded-2xl border border-[#52634f] bg-[#1c2820] p-5">
          <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={values.emailContactEnabled === "yes"}
              onChange={(event) =>
                update("emailContactEnabled", event.target.checked ? "yes" : "no")
              }
              className="mt-1 accent-[#b9d88b]"
            />
            <span>
              Recibir consultas también por correo{" "}
              <span className="font-normal text-[#a9b9a6]">(opcional)</span>
              <span className="mt-1 block font-normal text-[#9eaf9b]">
                Solo se mostrará a personas que hayan iniciado sesión. Puedes cambiarlo antes de
                publicar.
              </span>
            </span>
          </label>
          {values.emailContactEnabled === "yes" && (
            <label className="mt-4 block text-sm font-semibold">
              <span className="inline-flex items-center gap-2">
                {values.contactEmail.toLowerCase().endsWith("@gmail.com") ? (
                  <GmailMark className="size-[17px]" />
                ) : (
                  <Mail size={17} className="text-[#b9d88b]" />
                )}
                Correo para consultas
              </span>
              <input
                type="email"
                autoComplete="email"
                value={values.contactEmail}
                onChange={(event) => update("contactEmail", event.target.value)}
                onBlur={() => mark("contactEmail")}
                maxLength={254}
                placeholder="contacto@tungocio.cl"
                {...fieldState("contactEmail")}
                className="field mt-2"
              />
              {issue("contactEmail")}
            </label>
          )}
        </div>
        <label className="block text-sm font-semibold">
          Comuna base *
          <select
            name="comuna"
            value={values.comuna}
            onChange={(event) => update("comuna", event.target.value)}
            onBlur={() => mark("comuna")}
            {...fieldState("comuna")}
            className="field mt-2"
          >
            <option value="">Selecciona tu comuna</option>
            {communes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {issue("comuna")}
        </label>
        <label className="block text-sm font-semibold md:col-span-2">
          Cuéntales sobre tu negocio *
          <textarea
            name="description"
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            onBlur={() => mark("description")}
            maxLength={600}
            rows={4}
            placeholder="Qué haces, dónde trabajas y qué pueden esperar tus clientes."
            {...fieldState("description")}
            className="field mt-2 resize-y"
          />
          {issue("description")}
        </label>
      </div>
    </section>
  );
}
