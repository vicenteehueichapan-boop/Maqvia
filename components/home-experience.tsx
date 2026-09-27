"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search, Store } from "lucide-react";
import { CatalogGrid } from "@/components/catalog-grid";
import { ProviderShowcase } from "@/components/provider-showcase";
import { demoEquipment, demoProviders, providerForDemoEquipment } from "@/lib/demo-fixtures";
import { demoListing, demoProviderView } from "@/lib/listing-view";

type Tab = "buscar" | "publicar";
const categories = ["Todos", "Movimiento de tierra", "Carga y traslado"] as const;
const featured = demoEquipment.filter((item) =>
  ["miniexcavadora-3t", "minicargador-compacto", "cargador-frontal-central"].includes(item.id),
);
const showcaseProvider = demoProviders[0];
const showcaseListings = demoEquipment
  .filter((item) => item.providerSlug === showcaseProvider.slug)
  .slice(0, 2)
  .map((item) => demoListing(item, showcaseProvider));

export function HomeExperience() {
  const [tab, setTab] = useState<Tab>("buscar");
  const [category, setCategory] = useState<(typeof categories)[number]>("Todos");
  const visible = featured
    .filter((item) => category === "Todos" || item.category === category)
    .map((item) => demoListing(item, providerForDemoEquipment(item)));

  return (
    <section id="experiencia" className="container-shell py-20 md:py-27">
      <div className="grid items-end gap-6 lg:grid-cols-[1fr_.55fr]">
        <div>
          <p className="eyebrow">Explora antes de empezar</p>
          <h2 className="display mt-5 text-[clamp(2.8rem,5.3vw,5rem)]">
            Mira cómo funciona Maquinal.
          </h2>
        </div>
        <p className="muted-copy max-w-sm lg:ml-auto">
          Prueba una búsqueda y descubre cómo se verá la vitrina de un proveedor. Estos datos son
          ficticios.
        </p>
      </div>
      <div
        role="tablist"
        aria-label="Recorridos de ejemplo"
        className="mt-9 inline-flex gap-1 rounded-2xl border border-[#3d483e] bg-[#202724] p-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "buscar"}
          onClick={() => setTab("buscar")}
          className={
            "inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold md:px-6 " +
            (tab === "buscar" ? "bg-[#b9d88b] text-[#172016]" : "text-[#b4beb1] hover:text-white")
          }
        >
          <Search size={17} /> Buscar equipos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "publicar"}
          onClick={() => setTab("publicar")}
          className={
            "inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold md:px-6 " +
            (tab === "publicar" ? "bg-[#b9d88b] text-[#172016]" : "text-[#b4beb1] hover:text-white")
          }
        >
          <Store size={17} /> Ver vitrina
        </button>
      </div>
      <div role="tabpanel" className="mt-6">
        {tab === "buscar" ? (
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-t border-[#5b6c5a] pt-6">
              <div>
                <p className="eyebrow">Catálogo de ejemplo</p>
                <h3 className="mt-2 text-2xl font-bold tracking-[-.04em]">
                  Elige con información clara.
                </h3>
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Filtrar ejemplos por categoría">
                {categories.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={category === value}
                    onClick={() => setCategory(value)}
                    className={
                      "rounded-full border px-3 py-2 text-xs font-bold " +
                      (category === value
                        ? "border-[#b9d88b] bg-[#b9d88b1e] text-[#cee5b4]"
                        : "border-[#465147] text-[#a9b5a8] hover:border-[#879885]")
                    }
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <CatalogGrid key={category} listings={visible} userId={null} signInUrl="" />
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-[#a6b3a3]">
                EJEMPLO · Ninguno de estos equipos está disponible para arriendo.
              </p>
              <Link
                href="/maquinaria"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#c6dda9]"
              >
                Abrir catálogo <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <ProviderShowcase
              provider={demoProviderView(showcaseProvider)}
              listings={showcaseListings}
              contact={
                <Link
                  href={`/demo/proveedores/${showcaseProvider.slug}`}
                  className="action-secondary text-sm"
                >
                  Abrir vitrina completa <ArrowUpRight size={17} />
                </Link>
              }
            />
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#5b6c5a] pt-6">
              <p className="text-xs text-[#a6b3a3]">
                La vista previa utiliza las mismas tarjetas y fichas que verá un visitante.
              </p>
              <Link href="/crear-vitrina#vista-previa" className="action-primary text-sm">
                Probar con mis fotos <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
