import { type ReactNode } from "react";
import { type StepProps } from "./types";
import { categories, wizardSteps } from "@/lib/publish-constants";
import { serviceNames, type ServiceName, type ServiceOffer } from "@/lib/service-offers";

export interface StepEquipmentProps extends StepProps {
  step: number;
  selectedOffers: ServiceOffer[];
  setServiceOffer: (name: ServiceName, offer: ServiceOffer | null) => void;
  children?: ReactNode; // For StepPhotos
}

export function StepEquipment({
  step,
  values,
  update,
  mark,
  fieldState,
  issue,
  selectedOffers,
  setServiceOffer,
  children,
}: StepEquipmentProps) {
  return (
    <section data-publish-equipment className="rounded-[26px] premium-panel p-5 md:p-8">
      <div className="flex items-start gap-4 mb-7">
        <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-[#b9d88b1b] text-[#b9d88b] font-bold">
          {String(step + 1).padStart(2, "0")}
        </span>
        <div>
          <p className="eyebrow">Prepara tu publicación</p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-.04em]">{wizardSteps[step]}</h2>
          <p className="mt-1 text-sm text-[#a9b7a6]">
            Avanza a tu ritmo. Guardamos el borrador en este navegador.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block text-sm font-semibold" data-publish-step="1">
          Equipo o servicio *
          <input
            name="title"
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            onBlur={() => mark("title")}
            maxLength={100}
            placeholder="Ej. Miniexcavadora 3 toneladas"
            {...fieldState("title")}
            className="field mt-2"
          />
          {issue("title")}
        </label>
        <label className="block text-sm font-semibold" data-publish-step="1">
          Categoría *
          <select
            name="category"
            value={values.category}
            onChange={(event) => update("category", event.target.value)}
            onBlur={() => mark("category")}
            {...fieldState("category")}
            className="field mt-2"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {issue("category")}
        </label>
        <label className="block text-sm font-semibold md:col-span-2" data-publish-step="1">
          Descripción del equipo *
          <textarea
            name="details"
            value={values.details}
            onChange={(event) => update("details", event.target.value)}
            onBlur={() => mark("details")}
            maxLength={800}
            rows={4}
            placeholder="Capacidad, modelo, condiciones de arriendo, zonas de trabajo..."
            {...fieldState("details")}
            className="field mt-2 resize-y"
          />
          {issue("details")}
        </label>
        <label className="block text-sm font-semibold" data-publish-step="3">
          Precio
          <select
            name="priceKind"
            value={values.priceKind}
            onChange={(event) => update("priceKind", event.target.value)}
            className="field mt-2"
          >
            <option value="consult">Consultar precio</option>
            <option value="fixed">Precio fijo</option>
            <option value="from">Desde</option>
          </select>
        </label>
        {values.priceKind !== "consult" && (
          <>
            <label className="block text-sm font-semibold" data-publish-step="3">
              Monto en pesos *
              <input
                name="priceAmount"
                value={values.priceAmount}
                onChange={(event) => update("priceAmount", event.target.value)}
                onBlur={() => mark("priceAmount")}
                inputMode="numeric"
                placeholder="Ej. 95000"
                {...fieldState("priceAmount")}
                className="field mt-2"
              />
              {issue("priceAmount")}
            </label>
            <label className="block text-sm font-semibold" data-publish-step="3">
              Unidad
              <select
                name="priceUnit"
                value={values.priceUnit}
                onChange={(event) => update("priceUnit", event.target.value)}
                className="field mt-2"
              >
                <option value="day">Por día</option>
                <option value="hour">Por hora</option>
                <option value="week">Por semana</option>
                <option value="month">Por mes</option>
                <option value="service">Por servicio</option>
              </select>
            </label>
          </>
        )}
        <details
          data-publish-step="3"
          className="md:col-span-2 rounded-2xl border border-[#435447] bg-[#1b261f] p-5"
        >
          <summary className="cursor-pointer text-sm font-semibold text-[#dce9d8]">
            Agregar servicios y ajustar presentación (opcional)
          </summary>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-semibold">Servicios opcionales</legend>
              <p className="mt-1 text-xs text-[#a9b7a6]">
                Selecciona solo lo que realmente ofreces e indica cómo se cobra cada servicio.
              </p>
              <div className="mt-4 space-y-3">
                {serviceNames.map((name) => {
                  const offer = selectedOffers.find((item) => item.name === name);
                  return (
                    <div
                      key={name}
                      className="grid gap-3 rounded-xl border border-[#435447] bg-[#1b261f] p-4 sm:grid-cols-[1fr_190px_160px] sm:items-center"
                    >
                      <label className="flex items-center gap-3 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={Boolean(offer)}
                          onChange={(event) =>
                            setServiceOffer(
                              name,
                              event.target.checked ? { name, kind: "consult" } : null,
                            )
                          }
                          className="accent-[#b9d88b]"
                        />
                        {name}
                      </label>
                      {offer ? (
                        <>
                          <label className="text-xs text-[#b7c7b2]">
                            Modalidad
                            <select
                              aria-label={`Modalidad de ${name}`}
                              value={offer.kind}
                              onChange={(event) => {
                                const kind = event.target.value as ServiceOffer["kind"];
                                setServiceOffer(name, {
                                  name,
                                  kind,
                                  amount:
                                    kind === "fixed" || kind === "from" ? offer.amount : undefined,
                                });
                              }}
                              className="field mt-1"
                            >
                              <option value="consult">A consultar</option>
                              <option value="included">Incluido</option>
                              <option value="fixed">Precio fijo</option>
                              <option value="from">Desde</option>
                            </select>
                          </label>
                          {offer.kind === "fixed" || offer.kind === "from" ? (
                            <label className="text-xs text-[#b7c7b2]">
                              Monto en pesos
                              <input
                                aria-label={`Monto de ${name}`}
                                inputMode="numeric"
                                value={offer.amount ?? ""}
                                onChange={(event) => {
                                  const raw = event.target.value.trim();
                                  setServiceOffer(name, {
                                    name,
                                    kind: offer.kind,
                                    amount: /^\d+$/.test(raw) ? Number(raw) : undefined,
                                  });
                                }}
                                placeholder="Ej. 40000"
                                className="field mt-1"
                              />
                            </label>
                          ) : (
                            <span className="hidden sm:block" />
                          )}
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {issue("serviceOffers")}
            </fieldset>
            <label className="block text-sm font-semibold md:col-span-2">
              Otras condiciones (opcional, separa con comas)
              <input
                name="services"
                value={values.services}
                onChange={(event) => update("services", event.target.value)}
                maxLength={300}
                placeholder="Ej. operador disponible, traslado a consultar"
                className="field mt-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Sector referencial (opcional)
              <input
                name="sector"
                value={values.sector}
                onChange={(event) => update("sector", event.target.value)}
                maxLength={80}
                placeholder="Ej. sector industrial"
                className="field mt-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Ubicación
              <select
                name="locationPrecision"
                value={values.locationPrecision}
                onChange={(event) => update("locationPrecision", event.target.value)}
                className="field mt-2"
              >
                <option value="none">Mostrar solo comuna</option>
                <option value="approx">Mostrar sector aproximado</option>
              </select>
            </label>
            <label className="block text-sm font-semibold md:col-span-2">
              Presentación de la ficha
              <select
                name="presentationVariant"
                value={values.presentationVariant}
                onChange={(event) => update("presentationVariant", event.target.value)}
                className="field mt-2"
              >
                <option value="editorial">Editorial · equilibrada</option>
                <option value="visual">Visual · fotografías protagonistas</option>
                <option value="technical">Técnica · detalles protagonistas</option>
              </select>
            </label>
          </div>
        </details>
        {children}
      </div>
    </section>
  );
}
