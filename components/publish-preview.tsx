"use client";
import { useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { ListingDetail } from "@/components/listing-detail";
import { ProviderShowcase } from "@/components/provider-showcase";
import type { ListingView, ProviderView } from "@/lib/listing-view";
import type { PublicationValues } from "@/lib/publication-validation";

export function PublishPreview({
  values,
  images,
}: {
  values: PublicationValues;
  images: string[];
}) {
  const [tab, setTab] = useState<"card" | "detail" | "showcase">("card");
  const price = Number(values.priceAmount);
  const unit = { hour: "hora", day: "día", week: "semana", month: "mes", service: "servicio" }[
    values.priceUnit
  ];
  const priceLabel =
    values.priceKind === "consult" || !Number.isFinite(price) || price <= 0
      ? "Consultar precio"
      : `${values.priceKind === "from" ? "Desde " : ""}${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(price)} / ${unit}`;
  const listing: ListingView = {
    id: "borrador",
    title: values.title || "Tu maquinaria o servicio",
    category: values.category || "Categoría por definir",
    comuna: values.comuna,
    images,
    description: values.details || undefined,
    priceLabel,
    operator: values.operator === "yes" ? "A consultar" : undefined,
    delivery: values.delivery === "yes" ? "A consultar" : undefined,
    services: values.services
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    location: values.locationPrecision === "approx" ? "approx" : "none",
    sector: values.sector || undefined,
    providerName: values.name || "Tu negocio",
    esEjemplo: false,
    presentationVariant: values.presentationVariant,
  };
  const provider: ProviderView = {
    name: values.name || "Tu negocio",
    comuna: values.comuna,
    description: values.description || undefined,
    services: [],
    serviceAreas: values.comuna ? [values.comuna] : [],
    esEjemplo: false,
  };
  return (
    <section className="rounded-[26px] premium-panel p-5 md:p-8">
      <p className="eyebrow">Vista previa de lo que publicarás</p>
      <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">Revisa las tres vistas.</h2>
      <div role="tablist" aria-label="Vistas de publicación" className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["card", "Catálogo"],
            ["detail", "Ficha completa"],
            ["showcase", "Tu vitrina"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={
              "rounded-full px-4 py-2 text-sm font-bold " +
              (tab === value
                ? "bg-[#b9d88b] text-[#172016]"
                : "border border-[#667568] text-[#c5d3c2]")
            }
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-6">
        {tab === "card" ? (
          <div className="max-w-sm">
            <ListingCard listing={listing} inert />
          </div>
        ) : tab === "detail" ? (
          <ListingDetail
            listing={listing}
            preview
            contact={
              <p className="mt-4 text-sm text-[#aebdac]">
                Los clientes ingresarán para contactar directamente contigo.
              </p>
            }
          />
        ) : (
          <ProviderShowcase provider={provider} listings={[listing]} preview />
        )}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-[#aab9a8]">
        Esta vista usa los mismos componentes que la publicación. Los campos vacíos se muestran como
        pendientes; completa los datos antes de publicar.
      </p>
    </section>
  );
}
