import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { ListingView, ProviderView } from "@/lib/listing-view";
import { ListingCard } from "@/components/listing-card";

export function ProviderShowcase({
  provider,
  listings,
  contact,
  preview = false,
}: {
  provider: ProviderView;
  listings: ListingView[];
  contact?: ReactNode;
  preview?: boolean;
}) {
  return (
    <>
      <section className="relative overflow-hidden rounded-[28px] border border-[#3f4c42] bg-[#1b2320]">
        {provider.cover ? (
          <div className="relative h-55 md:h-75">
            <img
              src={provider.cover}
              alt="Imagen ilustrativa de maquinaria"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1b2320] to-[#1b232044]" />
          </div>
        ) : null}
        <div className="relative p-7 md:p-11">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">
                {provider.esEjemplo ? "Vitrina de ejemplo" : "Vitrina del proveedor"} · Santiago
              </p>
              <h1 className="display mt-4 text-[clamp(2.8rem,5vw,5rem)]">{provider.name}</h1>
              {provider.description && (
                <p className="muted-copy mt-5 max-w-2xl">{provider.description}</p>
              )}
              <p className="mt-5 inline-flex items-center gap-2 text-sm text-[#c5d1c0]">
                <MapPin size={17} />
                {provider.comuna}, Región Metropolitana
              </p>
            </div>
            {contact}
          </div>
        </div>
      </section>
      <section className="mt-12 grid lg:grid-cols-[.27fr_1fr] gap-8 lg:gap-12">
        <aside>
          <p className="eyebrow">Área de trabajo</p>
          <p className="mt-3 text-sm leading-relaxed text-[#c5d1c0]">
            {provider.serviceAreas.join(" · ")}
          </p>
          {provider.services.length > 0 && (
            <>
              <p className="eyebrow mt-8">Servicios indicados</p>
              <ul className="mt-3 space-y-2 text-sm text-[#c5d1c0]">
                {provider.services.map((service) => (
                  <li key={service}>↗ {service}</li>
                ))}
              </ul>
            </>
          )}
          {provider.esEjemplo && (
            <p className="mt-8 text-xs leading-relaxed text-[#9faa9d]">
              Perfil ficticio para probar Maquinal. Las fotografías son ilustrativas; ningún equipo
              representa inventario disponible.
            </p>
          )}
        </aside>
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Catálogo del proveedor</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">Equipos y servicios</h2>
            </div>
            <span className="text-xs text-[#9fae9e]">
              {listings.length} {listings.length === 1 ? "publicación" : "publicaciones"}
            </span>
          </div>
          {listings.length ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} inert={preview} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl premium-surface p-7 text-[#a8b7a4]">
              Este proveedor todavía no publica equipos.
            </p>
          )}
          {provider.esEjemplo && !preview && (
            <Link
              href="/publicar"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#c9e0b2]"
            >
              Crear mi propia vitrina <ArrowUpRight size={17} />
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
