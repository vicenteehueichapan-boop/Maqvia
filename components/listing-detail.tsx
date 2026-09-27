import Link from "next/link";
import { ArrowUpRight, MapPin, Truck } from "lucide-react";
import { LocationPanel } from "@/components/location-panel";
import type { ReactNode } from "react";
import type { ListingView } from "@/lib/listing-view";

export function ListingDetail({
  listing,
  contact,
  preview = false,
}: {
  listing: ListingView;
  contact?: ReactNode;
  preview?: boolean;
}) {
  return (
    <div
      className={
        "listing-variant listing-variant-" +
        (listing.presentationVariant || "editorial") +
        " grid lg:grid-cols-[1.05fr_.95fr] gap-7 lg:gap-13"
      }
    >
      <div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] border border-[#465548] bg-[#29342e]">
          {listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="fine-grid grid h-full place-items-center text-[#b2c0af]">
              Sin fotografía todavía
            </div>
          )}
          {listing.esEjemplo && !preview ? (
            <span className="absolute left-5 top-5 rounded-full bg-[#16201be8] px-3 py-1.5 text-[10px] font-bold tracking-widest">
              EJEMPLO · IMAGEN ILUSTRATIVA
            </span>
          ) : null}
        </div>
        {listing.images.length > 1 && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {listing.images.slice(1, 4).map((src, index) => (
              <img
                key={`${src}-${index}`}
                src={src}
                alt={`Vista ${index + 2} de ${listing.title}`}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full rounded-xl border border-[#465548] object-cover"
              />
            ))}
          </div>
        )}
        {listing.specs?.length ? (
          <div className="mt-5 border-t border-[#3e4b3f] pt-5">
            <p className="text-sm font-bold">Ficha técnica</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.specs.map((spec) => (
                <span
                  key={spec}
                  className="rounded-full border border-[#566459] px-3 py-1.5 text-xs text-[#c3d0bf]"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div>
        <p className="eyebrow">
          {listing.category} / {listing.comuna}
        </p>
        <h1 className="display mt-4 text-[clamp(2.7rem,5vw,4.7rem)]">{listing.title}</h1>
        <p className="mt-5 inline-flex items-center gap-2 text-sm text-[#bac7b6]">
          <MapPin size={17} />
          {listing.comuna === "Santiago" ? "Santiago" : `${listing.comuna}, Santiago`}
        </p>
        <div className="mt-7 border-y border-[#3e4b3f] py-5">
          <span className="text-xs text-[#a9b8a7]">Condición de arriendo</span>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {listing.priceLabel ?? "Consultar condiciones"}
          </p>
          {listing.esEjemplo ? (
            <p className="mt-1 text-xs text-[#a2b1a2]">Precio ilustrativo del escenario demo.</p>
          ) : null}
        </div>
        {contact && <div className="mt-5">{contact}</div>}
        {listing.description && (
          <div className="mt-7">
            <h2 className="text-lg font-bold">Sobre esta publicación</h2>
            <p className="mt-3 whitespace-pre-wrap muted-copy">{listing.description}</p>
          </div>
        )}
        {listing.operator || listing.delivery ? (
          <div className="mt-7 grid sm:grid-cols-2 gap-3">
            {listing.operator && (
              <div className="rounded-2xl premium-surface p-4">
                <p className="text-xs text-[#9fae9f]">Operador</p>
                <p className="mt-2 font-bold text-sm">{listing.operator}</p>
              </div>
            )}
            {listing.delivery && (
              <div className="rounded-2xl premium-surface p-4">
                <p className="text-xs text-[#9fae9f]">Traslado</p>
                <p className="mt-2 flex items-center gap-2 font-bold text-sm">
                  <Truck size={16} className="text-[#b9d88b]" />
                  {listing.delivery}
                </p>
              </div>
            )}
          </div>
        ) : null}
        {listing.services.length > 0 && (
          <div className="mt-7">
            <h2 className="text-sm font-bold">Servicios y condiciones indicadas</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.services.map((service) => (
                <span
                  key={service}
                  className="rounded-full bg-[#28372b] px-3 py-1.5 text-xs text-[#d7e7cf]"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}
        <LocationPanel listing={listing} />
        <div className="mt-8 rounded-[24px] premium-panel p-6">
          <p className="text-xs text-[#9eac9d]">Publicado por</p>
          {listing.providerHref && !preview ? (
            <Link
              href={listing.providerHref}
              className="mt-1 block text-xl font-bold hover:text-[#c7ddb3]"
            >
              {listing.providerName} <ArrowUpRight size={17} className="inline" />
            </Link>
          ) : (
            <p className="mt-1 text-xl font-bold">{listing.providerName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
